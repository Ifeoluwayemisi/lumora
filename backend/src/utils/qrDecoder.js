export function decodeQRcode(qrData) {
    if (typeof qrData !== 'string') return null;

    const codeValue = qrData.trim();
    if (!codeValue.startsWith('LUM-')) return null;
    return codeValue;
}