import { generateQRCode } from './backend/src/utils/qrGenerator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testQRGeneration() {
  try {
    console.log('[TEST] Starting QR generation test...');
    
    // Test with a sample code
    const testCode = 'LUM-TESTCODE123';
    console.log('[TEST] Generating QR for:', testCode);
    
    const result = await generateQRCode(testCode);
    console.log('[TEST] Function returned:', result);
    
    // Check if file exists
    const filePath = path.join(__dirname, 'backend', 'uploads', 'qrcodes', `${testCode}.png`);
    console.log('[TEST] Checking file at:', filePath);
    
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log('✅ File EXISTS!');
      console.log('   Size:', stats.size, 'bytes');
      console.log('   Created:', stats.birthtime);
    } else {
      console.log('❌ File DOES NOT EXIST');
      
      // Check if directory exists
      const dir = path.join(__dirname, 'backend', 'uploads', 'qrcodes');
      console.log('[TEST] Directory exists?', fs.existsSync(dir));
      if (fs.existsSync(dir)) {
        console.log('[TEST] Files in directory:');
        fs.readdirSync(dir).slice(0, 5).forEach(f => console.log('    -', f));
      }
    }
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    console.error(err.stack);
  }
}

testQRGeneration();
