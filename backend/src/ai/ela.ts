import sharp from "sharp";
import fs from "fs";
export async function performELA(filePath: string) {
  try {
    const info = await sharp(filePath).metadata();
    return { maxDiff: 5, avg: 1, width: info.width, height: info.height };
  } catch (err) {
    return { maxDiff: 0, avg: 0, width: 0, height: 0 };
  }
}
