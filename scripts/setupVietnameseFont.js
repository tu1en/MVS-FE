/**
 * Vietnamese Font Setup Script for jsPDF
 * This script helps you convert TTF fonts to jsPDF-compatible format
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class VietnameseFontSetup {
  constructor() {
    this.fontsDir = path.join(__dirname, '..', 'src', 'fonts');
    this.ensureFontsDirectory();
  }

  ensureFontsDirectory() {
    if (!fs.existsSync(this.fontsDir)) {
      fs.mkdirSync(this.fontsDir, { recursive: true });
      console.log('Created fonts directory:', this.fontsDir);
    }
  }

  /**
   * Convert TTF font file to base64 and generate JS file
   * @param {string} ttfPath - Path to TTF font file
   * @param {string} fontName - Name for the font (e.g., 'Roboto-Regular')
   */
  convertTTFToJS(ttfPath, fontName) {
    try {
      if (!fs.existsSync(ttfPath)) {
        throw new Error(`Font file not found: ${ttfPath}`);
      }

      console.log(`Converting ${fontName} font...`);
      
      // Read TTF file and convert to base64
      const fontBuffer = fs.readFileSync(ttfPath);
      const base64String = fontBuffer.toString('base64');
      
      // Generate JS file content
      const jsContent = `/**
 * ${fontName} Font for jsPDF with Vietnamese Support
 * Generated from TTF file: ${path.basename(ttfPath)}
 */

const ${fontName.replace(/[^a-zA-Z0-9]/g, '')}Font = '${base64String}';

export default ${fontName.replace(/[^a-zA-Z0-9]/g, '')}Font;

/**
 * Usage in jsPDF:
 * 
 * import ${fontName.replace(/[^a-zA-Z0-9]/g, '')}Font from '../fonts/${fontName}';
 * 
 * // Add font to jsPDF
 * doc.addFileToVFS('${fontName}.ttf', ${fontName.replace(/[^a-zA-Z0-9]/g, '')}Font);
 * doc.addFont('${fontName}.ttf', '${fontName}', 'normal');
 * 
 * // Use the font for Vietnamese text
 * doc.setFont('${fontName}');
 * doc.text('Tiếng Việt: áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệ', 10, 10);
 */`;

      // Write JS file
      const jsPath = path.join(this.fontsDir, `${fontName}.js`);
      fs.writeFileSync(jsPath, jsContent);
      
      console.log(`✅ Font converted successfully!`);
      console.log(`📁 JS file created: ${jsPath}`);
      console.log(`📏 Font size: ${(fontBuffer.length / 1024 / 1024).toFixed(2)} MB`);
      
      return jsPath;
    } catch (error) {
      console.error('❌ Error converting font:', error.message);
      throw error;
    }
  }

  /**
   * Download Vietnamese-compatible fonts
   */
  async downloadVietnameseFonts() {
    const fonts = [
      {
        name: 'Roboto-Regular',
        url: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
        description: 'Google Roboto Regular - Excellent Vietnamese support'
      },
      {
        name: 'OpenSans-Regular',
        url: 'https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVc.woff2',
        description: 'Open Sans Regular - Good Vietnamese support'
      }
    ];

    console.log('📥 Downloading Vietnamese-compatible fonts...');
    
    for (const font of fonts) {
      try {
        console.log(`\n⬇️  Downloading ${font.name}...`);
        console.log(`📝 ${font.description}`);
        
        const fontPath = path.join(this.fontsDir, `${font.name}.woff2`);
        await this.downloadFile(font.url, fontPath);
        
        console.log(`✅ Downloaded: ${fontPath}`);
        console.log(`ℹ️  Note: This is a WOFF2 file. For jsPDF, you need TTF format.`);
        console.log(`💡 Convert to TTF using online tools or FontForge.`);
        
      } catch (error) {
        console.error(`❌ Failed to download ${font.name}:`, error.message);
      }
    }
  }

  downloadFile(url, filePath) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filePath);
      
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          resolve(filePath);
        });
        
        file.on('error', (error) => {
          fs.unlink(filePath, () => {}); // Delete partial file
          reject(error);
        });
      }).on('error', reject);
    });
  }

  /**
   * Generate instructions for manual font setup
   */
  generateInstructions() {
    const instructions = `
🇻🇳 VIETNAMESE FONT SETUP INSTRUCTIONS FOR jsPDF
===============================================

STEP 1: GET A VIETNAMESE-COMPATIBLE TTF FONT
-------------------------------------------
Option A - Download Roboto (Recommended):
• Go to: https://fonts.google.com/specimen/Roboto
• Click "Download family"
• Extract the ZIP file
• Use "Roboto-Regular.ttf"

Option B - Use system fonts:
• Windows: C:\\Windows\\Fonts\\arial.ttf (supports Vietnamese)
• Use Times New Roman, Arial, or Calibri

STEP 2: CONVERT TTF TO JSPDF FORMAT
---------------------------------
Run this command in your project root:
node scripts/setupVietnameseFont.js convert "path/to/your/font.ttf" "FontName"

Example:
node scripts/setupVietnameseFont.js convert "C:/Windows/Fonts/arial.ttf" "Arial-Regular"

STEP 3: USE IN YOUR PDF GENERATOR
-------------------------------
1. Import the generated font file:
   import ArialRegularFont from '../fonts/Arial-Regular';

2. Add to jsPDF:
   doc.addFileToVFS('Arial-Regular.ttf', ArialRegularFont);
   doc.addFont('Arial-Regular.ttf', 'Arial', 'normal');

3. Use the font:
   doc.setFont('Arial');
   doc.text('Tiếng Việt có dấu', 10, 10);

STEP 4: TEST VIETNAMESE CHARACTERS
--------------------------------
Test these characters: áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ

TROUBLESHOOTING
--------------
• Font too large? Use font subsetting tools
• Characters not showing? Verify font supports Vietnamese
• PDF not loading? Check base64 encoding is correct

📧 Need help? Check the generated font files in src/fonts/
`;

    const instructionsPath = path.join(__dirname, '..', 'VIETNAMESE_FONT_SETUP.md');
    fs.writeFileSync(instructionsPath, instructions);
    console.log(`📋 Instructions saved to: ${instructionsPath}`);
    
    return instructions;
  }
}

// CLI Interface
if (require.main === module) {
  const setup = new VietnameseFontSetup();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🇻🇳 Vietnamese Font Setup for jsPDF');
    console.log('=====================================\n');
    console.log('Usage:');
    console.log('  node setupVietnameseFont.js convert <ttf-path> <font-name>');
    console.log('  node setupVietnameseFont.js download');
    console.log('  node setupVietnameseFont.js instructions');
    console.log('\nExamples:');
    console.log('  node setupVietnameseFont.js convert "C:/Windows/Fonts/arial.ttf" "Arial-Regular"');
    console.log('  node setupVietnameseFont.js convert "./fonts/Roboto-Regular.ttf" "Roboto-Regular"');
    console.log('  node setupVietnameseFont.js download');
    console.log('  node setupVietnameseFont.js instructions');
    process.exit(0);
  }
  
  const command = args[0];
  
  switch (command) {
    case 'convert':
      if (args.length < 3) {
        console.error('❌ Usage: node setupVietnameseFont.js convert <ttf-path> <font-name>');
        process.exit(1);
      }
      setup.convertTTFToJS(args[1], args[2]);
      break;
      
    case 'download':
      setup.downloadVietnameseFonts();
      break;
      
    case 'instructions':
      console.log(setup.generateInstructions());
      break;
      
    default:
      console.error('❌ Unknown command:', command);
      process.exit(1);
  }
}

module.exports = VietnameseFontSetup;
