/**
 * Roboto Regular Font for jsPDF with Vietnamese Support
 * This font supports Vietnamese characters including diacritics
 */

// Note: This is a placeholder for the actual base64 font data
// You'll need to replace this with the actual Roboto Regular font base64 string
const RobotoRegularFont = `
// Base64 font data will go here
// This is a placeholder - you need to convert your actual TTF file
`;

export default RobotoRegularFont;

/**
 * Usage in jsPDF:
 * 
 * import RobotoRegularFont from '../fonts/RobotoRegular';
 * 
 * // Add font to jsPDF
 * doc.addFileToVFS('Roboto-Regular.ttf', RobotoRegularFont);
 * doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
 * 
 * // Use the font
 * doc.setFont('Roboto');
 * doc.text('Tiếng Việt có dấu: áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệ', 10, 10);
 */
