import prisma from "../models/prismaClient.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "../../uploads/documents");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Upload manufacturer verification document
 */
export const uploadDocument = async (req, res) => {
  try {
    const manufacturerId = req.user.id;
    const { documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    if (!documentType) {
      return res.status(400).json({ error: "Document type required" });
    }

    // Valid document types
    const validTypes = [
      "cac",
      "trademark",
      "regulatory",
      "factory",
      "website",
      "contract",
      "authorization",
    ];

    if (!validTypes.includes(documentType)) {
      return res.status(400).json({ error: "Invalid document type" });
    }

    // Get manufacturer
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    // Check if document already exists for this type
    const existingDoc = await prisma.document.findUnique({
      where: {
        manufacturerId_type: {
          manufacturerId,
          type: documentType,
        },
      },
    });

    // Generate unique filename
    const filename = `${manufacturerId}_${documentType}_${Date.now()}${path.extname(
      req.file.originalname
    )}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Save file
    fs.writeFileSync(filepath, req.file.buffer);

    // Save to database
    const document = await prisma.document.upsert({
      where: {
        manufacturerId_type: {
          manufacturerId,
          type: documentType,
        },
      },
      update: {
        filename,
        filepath,
        status: "pending_review",
        uploadedAt: new Date(),
      },
      create: {
        manufacturerId,
        type: documentType,
        filename,
        filepath,
        status: "pending_review",
        uploadedAt: new Date(),
      },
    });

    console.log(
      `[DOCUMENT] ${documentType} uploaded for manufacturer ${manufacturerId}`
    );

    return res.status(200).json({
      message: "Document uploaded successfully",
      document: {
        id: document.id,
        type: document.type,
        status: document.status,
        uploadedAt: document.uploadedAt,
      },
    });
  } catch (error) {
    console.error("[DOCUMENT] Upload error:", error);
    return res.status(500).json({
      error: "Upload failed",
      message: error.message,
    });
  }
};

/**
 * Get manufacturer documents
 */
export const getDocuments = async (req, res) => {
  try {
    const manufacturerId = req.user.id;

    const documents = await prisma.document.findMany({
      where: { manufacturerId },
      select: {
        id: true,
        type: true,
        status: true,
        uploadedAt: true,
        approvedAt: true,
        rejectionReason: true,
      },
    });

    return res.status(200).json({
      documents,
      stats: {
        total: documents.length,
        approved: documents.filter((d) => d.status === "approved").length,
        pending: documents.filter((d) => d.status === "pending_review").length,
        rejected: documents.filter((d) => d.status === "rejected").length,
      },
    });
  } catch (error) {
    console.error("[DOCUMENT] Fetch error:", error);
    return res.status(500).json({
      error: "Failed to fetch documents",
      message: error.message,
    });
  }
};

/**
 * Delete document (admin only)
 */
export const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const manufacturerId = req.user.id;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Verify ownership
    if (document.manufacturerId !== manufacturerId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filepath)) {
      fs.unlinkSync(document.filepath);
    }

    // Delete from database
    await prisma.document.delete({
      where: { id: documentId },
    });

    return res.status(200).json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("[DOCUMENT] Delete error:", error);
    return res.status(500).json({
      error: "Failed to delete document",
      message: error.message,
    });
  }
};
