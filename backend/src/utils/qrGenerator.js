import QRCode from "qrcode";
import path from "path";
import fs from "fs";

export async function generateQRCode(codeValue) {
  const dir = path.join(process.cwd(), "uploads/qrcodes");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const fileName = `${codeValue}.png`;
  const filePath = path.join(dir, fileName);

  await QRCode.toFile(filePath, codeValue, {
    errorCorrectionLevel: "H",
    type: "png",
    width: 300,
  });

  // Return relative URL path instead of absolute file path
  return `/uploads/qrcodes/${fileName}`;
}
