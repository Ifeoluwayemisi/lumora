import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import sharp from "sharp";

const pump = promisify(pipeline);

export function ensureUploadDirs() {
  const dirs = [
    process.env.CERT_UPLOAD_PATH || "./uploads/certificates",
    process.env.PRODUCT_UPLOAD_PATH || "./uploads/products",
    process.env.QR_UPLOAD_PATH || "./uploads/qrs",
  ];
  for (const d of dirs) {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  }
}

export async function saveMultipartFile(file: any, destDir: string) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
  const mimetype = file.mimetype || file.headers?.["content-type"] || "";
  if (!allowed.includes(mimetype)) {
    throw new Error("Invalid file type");
  }

  const filename = `${Date.now()}-${(file.filename || "upload").replace(/[^a-zA-Z0-9._-]/g, "")}`;
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const outPath = path.join(destDir, filename);

  await pump(file.file, fs.createWriteStream(outPath));

  // basic validation
  if (mimetype.startsWith("image/")) {
    try { await sharp(outPath).metadata(); } catch (e) { fs.unlinkSync(outPath); throw new Error("Invalid image file"); }
  } else if (mimetype === "application/pdf") {
    const stats = fs.statSync(outPath);
    if (stats.size < 1000) { fs.unlinkSync(outPath); throw new Error("PDF too small / invalid"); }
  }

  return outPath;
}
