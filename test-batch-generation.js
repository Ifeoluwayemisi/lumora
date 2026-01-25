import { generateCodesForBatch } from './backend/src/services/codeService.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function testBatchGeneration() {
  try {
    console.log('\n[TEST] Testing batch code generation...\n');
    
    // Get a test manufacturer
    const manufacturer = await prisma.manufacturer.findFirst({
      select: { id: true, companyName: true }
    });

    if (!manufacturer) {
      console.log('❌ No manufacturer found in database');
      await prisma.$disconnect();
      return;
    }

    // Get a test product
    const product = await prisma.product.findFirst({
      select: { id: true, name: true }
    });

    if (!product) {
      console.log('❌ No product found in database');
      await prisma.$disconnect();
      return;
    }

    console.log(`[TEST] Using manufacturer: ${manufacturer.companyName}`);
    console.log(`[TEST] Using product: ${product.name}`);
    
    // Generate a test batch
    const result = await generateCodesForBatch(
      manufacturer.id,
      product.id,
      `TEST-BATCH-${Date.now()}`,
      new Date(Date.now() + 365*24*60*60*1000), // 1 year from now
      3  // Just 3 codes to test
    );

    console.log(`\n[TEST] ✅ Batch created successfully!`);
    console.log(`[TEST]    Batch ID: ${result.batch.id}`);
    console.log(`[TEST]    Codes generated: ${result.codes.length}`);

    // Check if files exist
    console.log(`\n[TEST] Checking if QR files were created:`);
    result.codes.forEach(code => {
      const qrDir = path.join(process.cwd(), 'backend/uploads/qrcodes');
      const filePath = path.join(qrDir, `${code.codeValue}.png`);
      const exists = fs.existsSync(filePath);
      console.log(`[TEST]   ${code.codeValue}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    });

  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    console.error(err.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testBatchGeneration();
