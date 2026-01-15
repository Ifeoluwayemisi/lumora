import QRCode from "qrcode";
import path from "path";
import fs from "fs";

export async function generateQRCode(codeValue) {
  const dir = path.join(process.cwd(), "uploads/qrcodes");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${codeValue}.png`);

  await QRCode.toFile(filePath, codeValue, {
    errorCorrectionLevel: "H",
    type: "png",
    width: 300,
  });
  return filePath;
}
