import { PDFDocument, rgb, PDFPage } from "pdf-lib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Generate a printable PDF with codes and QR codes
 * Perfect for printing on A4 sheets and applying stickers to products
 */
export async function generateBatchPDF(batch, codes) {
  try {
    const pdfDoc = await PDFDocument.create();

    // Use standard A4 dimensions
    const pageWidth = 595; // A4 width in points
    const pageHeight = 842; // A4 height in points
    const margin = 40;
    const usableWidth = pageWidth - margin * 2;

    // Calculate layout: 3 columns × 4 rows per page = 12 codes per page
    const codesPerRow = 3;
    const codesPerColumn = 4;
    const codesPerPage = codesPerRow * codesPerColumn;
    const codeWidth = usableWidth / codesPerRow;
    const codeHeight = (pageHeight - margin * 2 - 100) / codesPerColumn; // Leave space for header

    // Header information
    const headerHeight = 80;

    // Add pages for all codes
    let codeIndex = 0;
    while (codeIndex < codes.length) {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      // Draw header on first page
      if (codeIndex === 0) {
        drawHeader(page, batch, pageWidth, pageHeight, margin, headerHeight);
      }

      // Draw codes for this page
      const codesOnThisPage = codes.slice(
        codeIndex,
        Math.min(codeIndex + codesPerPage, codes.length),
      );

      let row = 0;
      let col = 0;

      for (const code of codesOnThisPage) {
        const x = margin + col * codeWidth;
        const y =
          pageHeight -
          margin -
          headerHeight -
          (row + 1) * codeHeight -
          (codeIndex === 0 ? 0 : -headerHeight);

        await drawCodeBox(page, code, x, y, codeWidth, codeHeight);

        col++;
        if (col >= codesPerRow) {
          col = 0;
          row++;
        }
      }

      codeIndex += codesPerPage;
    }

    // Save to buffer
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error("[PDF_GENERATION] Error:", error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

/**
 * Draw header with batch and product information
 */
function drawHeader(page, batch, pageWidth, pageHeight, margin, headerHeight) {
  const x = margin;
  const y = pageHeight - margin - headerHeight;

  // Title
  page.drawText("PRODUCT VERIFICATION CODE BATCH", {
    x: x + 10,
    y: y + 60,
    size: 14,
    color: rgb(0, 0, 0),
    font: undefined,
  });

  // Batch info
  page.drawText(
    `Batch: ${batch.batchNumber || batch.id} | Product: ${batch.product?.name || "N/A"}`,
    {
      x: x + 10,
      y: y + 40,
      size: 10,
      color: rgb(80 / 255, 80 / 255, 80 / 255),
    },
  );

  page.drawText(
    `Expiry Date: ${new Date(batch.expirationDate).toLocaleDateString()} | Total Codes: ${batch.codes?.length || 0}`,
    {
      x: x + 10,
      y: y + 20,
      size: 10,
      color: rgb(80 / 255, 80 / 255, 80 / 255),
    },
  );

  // Divider line
  page.drawLine({
    start: { x: x, y: y - 5 },
    end: { x: pageWidth - margin, y: y - 5 },
    thickness: 1,
    color: rgb(200 / 255, 200 / 255, 200 / 255),
  });
}

/**
 * Draw a code box with code value and QR code image
 * Layout: Code value on top, QR code in middle, status at bottom
 */
async function drawCodeBox(page, code, x, y, width, height) {
  const borderColor = rgb(200 / 255, 200 / 255, 200 / 255);
  const textColor = rgb(0, 0, 0);
  const padding = 8;

  // Draw border
  page.drawRectangle({
    x,
    y,
    width,
    height,
    borderColor,
    borderWidth: 1,
  });

  // Code value
  page.drawText(code.codeValue, {
    x: x + padding,
    y: y + height - 20,
    size: 9,
    color: textColor,
    font: undefined,
  });

  // Try to embed QR code image
  try {
    if (code.qrImagePath) {
      // Get absolute path to uploads folder
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const uploadsPath = path.join(__dirname, "../../uploads");
      
      // Try different path variations
      let qrFilePath = null;
      
      // If path is relative (starts with /uploads or just has filename)
      if (code.qrImagePath.startsWith("/uploads")) {
        qrFilePath = path.join(uploadsPath, code.qrImagePath.replace("/uploads", ""));
      } else if (code.qrImagePath.includes("uploads")) {
        // Extract the part after uploads folder
        const uploadsIndex = code.qrImagePath.indexOf("uploads");
        qrFilePath = path.join(uploadsPath, code.qrImagePath.substring(uploadsIndex + 7));
      } else {
        // Assume it's just the filename
        qrFilePath = path.join(uploadsPath, "qrcodes", code.qrImagePath);
      }

      console.log(`[PDF_QR] Attempting to load QR code: ${code.codeValue}`);
      console.log(`[PDF_QR] QR path from DB: ${code.qrImagePath}`);
      console.log(`[PDF_QR] Resolved file path: ${qrFilePath}`);

      // Check if file exists
      if (fs.existsSync(qrFilePath)) {
        try {
          // Read image file
          const imageBytes = fs.readFileSync(qrFilePath);
          console.log(`[PDF_QR] QR image loaded - Size: ${imageBytes.length} bytes`);

          // Embed image in PDF
          const image = await page.doc.embedPng(imageBytes);

          // Calculate QR code box size (leave space for code and status)
          const qrSize = Math.min(width - padding * 2, height - 50);
          const qrX = x + (width - qrSize) / 2;
          const qrY = y + (height - qrSize) / 2 - 10;

          // Draw QR code image
          page.drawImage(image, {
            x: qrX,
            y: qrY,
            width: qrSize,
            height: qrSize,
          });

          console.log(`[PDF_QR] QR embedded successfully for ${code.codeValue}`);
        } catch (imgError) {
          console.warn(`[PDF_QR] Failed to embed QR image: ${imgError.message}`);
          // Fall back to placeholder
          page.drawText("(QR Code)", {
            x: x + width / 2 - 15,
            y: y + height / 2 - 5,
            size: 8,
            color: rgb(150 / 255, 150 / 255, 150 / 255),
          });
        }
      } else {
        console.warn(`[PDF_QR] QR file not found: ${qrFilePath}`);
        // Draw placeholder
        page.drawText("(QR Code)", {
          x: x + width / 2 - 15,
          y: y + height / 2 - 5,
          size: 8,
          color: rgb(150 / 255, 150 / 255, 150 / 255),
        });
      }
    } else {
      console.warn(`[PDF_QR] No qrImagePath for code: ${code.codeValue}`);
      page.drawText("(QR Code)", {
        x: x + width / 2 - 15,
        y: y + height / 2 - 5,
        size: 8,
        color: rgb(150 / 255, 150 / 255, 150 / 255),
      });
    }
  } catch (error) {
    console.error(`[PDF_QR] Error processing QR code: ${error.message}`);
    page.drawText("(Error)", {
      x: x + width / 2 - 15,
      y: y + height / 2 - 5,
      size: 8,
      color: rgb(1, 0, 0), // Red
    });
  }

  // Status
  const status = code.isUsed ? "USED" : "UNUSED";
  const statusColor = code.isUsed ? rgb(200 / 255, 0, 0) : rgb(0, 150 / 255, 0);

  page.drawText(status, {
    x: x + width - 40,
    y: y + padding,
    size: 8,
    color: statusColor,
  });

  // Print instruction
  page.drawText("Print & Attach", {
    x: x + padding,
    y: y + padding,
    size: 7,
    color: rgb(150 / 255, 150 / 255, 150 / 255),
  });
}

/**
 * Generate a simple CSV for backup
 */
export function generateBatchCSV(batch, codes) {
  let csv = "Code Value,Status,Created Date,Product,Batch\n";

  for (const code of codes) {
    const row = [
      code.codeValue,
      code.isUsed ? "USED" : "UNUSED",
      new Date(code.createdAt).toISOString().split("T")[0],
      batch.product?.name || "N/A",
      batch.batchNumber || batch.id,
    ];
    csv += row.map((field) => `"${field}"`).join(",") + "\n";
  }

  return Buffer.from(csv);
}
