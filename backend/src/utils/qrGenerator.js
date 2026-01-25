import QRCode from "qrcode";

/**
 * Generate QR code and return as data URI (base64)
 * This is persisted to database, avoiding Render ephemeral filesystem issues
 *
 * @param {string} codeValue - The value to encode in the QR code
 * @returns {Promise<string>} Data URI of the QR code (data:image/png;base64,...)
 */
export async function generateQRCode(codeValue) {
  try {
    console.log("[QR_GENERATOR] Generating QR code for:", codeValue);

    // Generate QR code as data URI directly (no file write needed)
    const dataUri = await QRCode.toDataURL(codeValue, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 300,
    });

    console.log("[QR_GENERATOR] QR code generated successfully as data URI");
    console.log(
      "[QR_GENERATOR] Data URI length:",
      dataUri.length,
      "characters",
    );

    return dataUri;
  } catch (error) {
    console.error("[QR_GENERATOR] ERROR generating QR code:", error.message);
    throw error;
  }
}
