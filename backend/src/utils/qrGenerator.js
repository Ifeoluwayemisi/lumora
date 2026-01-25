import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

export async function generateQRCode(codeValue) {
  try {
    // Get the absolute path relative to this file's location
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dir = path.join(__dirname, "../../uploads/qrcodes");

    console.log("[QR_GENERATOR] ✓ Starting QR generation for code:", codeValue);
    console.log("[QR_GENERATOR]   Working directory:", process.cwd());
    console.log("[QR_GENERATOR]   Script location:", __filename);
    console.log("[QR_GENERATOR]   Output directory:", dir);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      console.log("[QR_GENERATOR]   Creating directory...");
      fs.mkdirSync(dir, { recursive: true });
      console.log("[QR_GENERATOR]   ✓ Directory created");
    } else {
      console.log("[QR_GENERATOR]   ✓ Directory exists");
    }

    const fileName = `${codeValue}.png`;
    const filePath = path.join(dir, fileName);
    console.log("[QR_GENERATOR]   Output file:", filePath);

    // Generate QR code
    console.log("[QR_GENERATOR]   Generating QR code...");
    await QRCode.toFile(filePath, codeValue, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 300,
    });
    console.log("[QR_GENERATOR]   ✓ QR code generated");

    // Verify file was created
    if (!fs.existsSync(filePath)) {
      throw new Error(`QR file was not created at: ${filePath}`);
    }

    const fileSize = fs.statSync(filePath).size;
    console.log("[QR_GENERATOR]   ✓ File verified - Size:", fileSize, "bytes");

    const relativePath = `/uploads/qrcodes/${fileName}`;
    console.log("[QR_GENERATOR]   ✓ Returning path:", relativePath);
    
    return relativePath;
  } catch (error) {
    console.error("[QR_GENERATOR] ❌ CRITICAL ERROR:", error.message);
    console.error("[QR_GENERATOR]    Stack:", error.stack);
    throw error; // Re-throw so batch creation fails too
  }
}
