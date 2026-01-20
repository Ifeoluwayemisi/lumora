import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

export async function generateQRCode(codeValue) {
  // Get the absolute path relative to this file's location
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const dir = path.join(__dirname, "../../uploads/qrcodes");

  console.log("[QR_GENERATOR] Working directory:", process.cwd());
  console.log("[QR_GENERATOR] Script directory:", __dirname);
  console.log("[QR_GENERATOR] QR output directory:", dir);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log("[QR_GENERATOR] Created QR directory:", dir);
  }

  const fileName = `${codeValue}.png`;
  const filePath = path.join(dir, fileName);
  console.log("[QR_GENERATOR] Generating QR code for:", codeValue);
  console.log("[QR_GENERATOR] Full file path:", filePath);

  await QRCode.toFile(filePath, codeValue, {
    errorCorrectionLevel: "H",
    type: "png",
    width: 300,
  });

  const relativePath = `/uploads/qrcodes/${fileName}`;
  console.log("[QR_GENERATOR] QR file saved successfully");
  console.log("[QR_GENERATOR] Returning relative path:", relativePath);

  // Verify file exists
  if (fs.existsSync(filePath)) {
    const fileSize = fs.statSync(filePath).size;
    console.log("[QR_GENERATOR] File verified - Size:", fileSize, "bytes");
  } else {
    console.error(
      "[QR_GENERATOR] ERROR: File not found after creation:",
      filePath,
    );
  }

  return relativePath;
}
