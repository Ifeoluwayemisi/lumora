import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import sharp from "sharp";
import { scanFile } from "./clam";

const pump = promisify(pipeline);

export function ensureUploadDirs() {
  const dirs = [
    process.env.CERT_UPLOAD_PATH || "../../uploads/certificates",
    process.env.PRODUCT_UPLOAD_PATH || "../../uploads/products",
    process.env.QR_UPLOAD_PATH || "../../uploads/qrs",
  ];
  for (const d of dirs) {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  }
}

export async function saveMultipartFile(file: any, destDir: string) {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
    "application/docs"
  ];
  const mimetype = file.mimetype || file.headers?.["content-type"] || "";
  if (!allowed.includes(mimetype)) {
    throw new Error("Invalid file type");
  }

  const safeName = `${Date.now()}-${(file.filename || "upload").replace(
    /[^a-zA-Z0-9._-]/g,
    ""
  )}`;
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const tmpPath = path.join(destDir, `.tmp-${safeName}`);
  const outPath = path.join(destDir, safeName);

  // Stream to temporary file first
  await pump(file.file, fs.createWriteStream(tmpPath));

  // Virus scan with ClamAV
  try {
    const result = await scanFile(tmpPath);
    if (result.infected) {
      try {
        fs.unlinkSync(tmpPath);
      } catch {}
      throw new Error("Uploaded file is infected");
    }
  } catch (err) {
    try {
      fs.unlinkSync(tmpPath);
    } catch {}
    throw new Error("Virus scan failed or ClamAV not available");
  }

  // Validate images with sharp
  if (mimetype.startsWith("image/")) {
    try {
      await sharp(tmpPath).metadata();
    } catch (e) {
      try {
        fs.unlinkSync(tmpPath);
      } catch {}
      throw new Error("Invalid image file");
    }
  } else if (mimetype === "application/pdf") {
    const stats = fs.statSync(tmpPath);
    if (stats.size < 1000) {
      try {
        fs.unlinkSync(tmpPath);
      } catch {}
      throw new Error("PDF too small / invalid");
    }
  }

  // Move to final path
  fs.renameSync(tmpPath, outPath);
  return outPath;
}

export async function saveBase64Image(
  dataUrl: string,
  destDir: string,
  filename?: string
) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const matches = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid data url");

  const ext = matches[1].split("/")[1];
  const buffer = Buffer.from(matches[2], "base64");
  const fileName = filename || `${Date.now()}.${ext}`;
  const outPath = path.join(destDir, fileName);
  fs.writeFileSync(outPath, buffer);

  // Validate image
  try {
    await sharp(outPath).metadata();
  } catch (e) {
    fs.unlinkSync(outPath);
    throw new Error("Invalid image file");
  }

  return outPath;
}
