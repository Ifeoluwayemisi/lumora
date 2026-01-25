import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAllCodesWithMissingFiles() {
  try {
    // Get all codes with paths that don't exist
    const allCodes = await prisma.code.findMany({
      select: {
        codeValue: true,
        qrImagePath: true,
        createdAt: true,
        batch: {
          select: {
            batchNumber: true,
            manufacturer: {
              select: {
                companyName: true
              }
            }
          }
        }
      },
      take: 100
    });

    console.log(`\n📊 Total codes checked: ${allCodes.length}\n`);

    let withNullPath = 0;
    let withEmptyPath = 0;
    let otherPath = 0;

    allCodes.forEach(code => {
      if (!code.qrImagePath) {
        withNullPath++;
        console.log(`⚠️ NULL path: ${code.codeValue}`);
      } else if (code.qrImagePath === '') {
        withEmptyPath++;
        console.log(`⚠️ EMPTY path: ${code.codeValue}`);
      } else {
        // Assume the file should exist
        otherPath++;
      }
    });

    console.log(`\n📈 Summary:`);
    console.log(`   NULL paths: ${withNullPath}`);
    console.log(`   EMPTY paths: ${withEmptyPath}`);
    console.log(`   Other paths: ${otherPath}`);
    
    // Show a sample of codes with paths
    if (otherPath > 0) {
      console.log(`\n📋 Sample codes with paths:`);
      allCodes.filter(c => c.qrImagePath && c.qrImagePath !== '').slice(0, 5).forEach(code => {
        console.log(`   ${code.codeValue}: ${code.qrImagePath}`);
      });
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllCodesWithMissingFiles();
