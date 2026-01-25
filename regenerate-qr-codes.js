import { generateQRCode } from './backend/src/utils/qrGenerator.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function regenerateAllQRCodes() {
  try {
    console.log('\n[REGENERATE] Starting QR code regeneration...\n');

    // Get all codes from database
    const codes = await prisma.code.findMany({
      select: {
        id: true,
        codeValue: true,
        qrImagePath: true
      }
    });

    console.log(`[REGENERATE] Found ${codes.length} codes in database\n`);

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    // Check which files actually exist
    const qrDir = path.join(process.cwd(), 'backend/uploads/qrcodes');
    for (const code of codes) {
      const filePath = path.join(qrDir, `${code.codeValue}.png`);
      
      if (fs.existsSync(filePath)) {
        console.log(`[REGENERATE] ✓ EXISTS: ${code.codeValue}`);
        skippedCount++;
      } else {
        try {
          console.log(`[REGENERATE] ⏳ Generating: ${code.codeValue}...`);
          const qrPath = await generateQRCode(code.codeValue);
          
          // Verify the file was created
          if (fs.existsSync(filePath)) {
            console.log(`[REGENERATE] ✅ CREATED: ${code.codeValue}`);
            successCount++;
          } else {
            console.error(`[REGENERATE] ❌ FAILED: File not found after generation: ${code.codeValue}`);
            failCount++;
          }
        } catch (err) {
          console.error(`[REGENERATE] ❌ ERROR generating ${code.codeValue}:`, err.message);
          failCount++;
        }
      }
    }

    console.log(`\n[REGENERATE] ✅ COMPLETE`);
    console.log(`[REGENERATE]    Generated: ${successCount}`);
    console.log(`[REGENERATE]    Failed: ${failCount}`);
    console.log(`[REGENERATE]    Skipped (already exist): ${skippedCount}`);
    console.log(`[REGENERATE]    Total: ${codes.length}`);

  } catch (err) {
    console.error('\n[REGENERATE] ❌ FATAL ERROR:', err.message);
    console.error(err.stack);
  } finally {
    await prisma.$disconnect();
  }
}

regenerateAllQRCodes();
