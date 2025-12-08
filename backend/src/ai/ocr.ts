import Tesseract from "tesseract.js";
export async function performOCR(filePath: string) {
  try {
    const res = await Tesseract.recognize(filePath, "eng", { logger: () => {} });
    return { text: res.data.text, words: res.data.words?.length ?? 0 };
  } catch (err) {
    return { text: "", words: 0 };
  }
}
