/**
 * Font Converter Utility for jsPDF Vietnamese Support
 * This utility helps convert TTF fonts to base64 format for jsPDF
 */

import fs from 'fs';
import path from 'path';

class FontConverter {
  /**
   * Convert TTF font file to base64 string
   * @param {string} fontPath - Path to the TTF font file
   * @returns {string} - Base64 encoded font string
   */
  static convertTTFToBase64(fontPath) {
    try {
      const fontBuffer = fs.readFileSync(fontPath);
      const base64String = fontBuffer.toString('base64');
      return base64String;
    } catch (error) {
      console.error('Error converting font to base64:', error);
      throw error;
    }
  }

  /**
   * Generate font JS file for jsPDF
   * @param {string} fontPath - Path to the TTF font file
   * @param {string} fontName - Name for the font (e.g., 'Roboto-Regular')
   * @param {string} outputPath - Output path for the JS file
   */
  static generateFontJS(fontPath, fontName, outputPath) {
    try {
      const base64String = this.convertTTFToBase64(fontPath);
      
      const fontJS = `/**
 * ${fontName} Font for jsPDF
 * Generated automatically from TTF file
 */

const ${fontName.replace(/[^a-zA-Z0-9]/g, '')}Font = '${base64String}';

export default ${fontName.replace(/[^a-zA-Z0-9]/g, '')}Font;

// Usage in jsPDF:
// import ${fontName.replace(/[^a-zA-Z0-9]/g, '')}Font from './path/to/this/file';
// doc.addFileToVFS('${fontName}.ttf', ${fontName.replace(/[^a-zA-Z0-9]/g, '')}Font);
// doc.addFont('${fontName}.ttf', '${fontName}', 'normal');
// doc.setFont('${fontName}');
`;

      fs.writeFileSync(outputPath, fontJS);
      console.log(`Font JS file generated successfully: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('Error generating font JS file:', error);
      throw error;
    }
  }

  /**
   * Download font from URL and convert to JS
   * @param {string} fontUrl - URL to download font from
   * @param {string} fontName - Name for the font
   * @param {string} outputDir - Output directory for files
   */
  static async downloadAndConvertFont(fontUrl, fontName, outputDir) {
    try {
      const response = await fetch(fontUrl);
      if (!response.ok) {
        throw new Error(`Failed to download font: ${response.statusText}`);
      }
      
      const fontBuffer = await response.arrayBuffer();
      const fontPath = path.join(outputDir, `${fontName}.ttf`);
      const jsPath = path.join(outputDir, `${fontName}.js`);
      
      // Save TTF file
      fs.writeFileSync(fontPath, Buffer.from(fontBuffer));
      console.log(`Font downloaded: ${fontPath}`);
      
      // Generate JS file
      this.generateFontJS(fontPath, fontName, jsPath);
      
      return { fontPath, jsPath };
    } catch (error) {
      console.error('Error downloading and converting font:', error);
      throw error;
    }
  }
}

export default FontConverter;
