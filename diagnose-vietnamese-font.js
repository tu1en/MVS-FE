/**
 * Vietnamese Font Diagnostic Script
 * This script will help diagnose Vietnamese font rendering issues in jsPDF
 */

// Import required modules
import { jsPDF } from 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

// Vietnamese test text with comprehensive diacritics
const vietnameseTestText = {
    basic: "Xin chào! Tôi là sinh viên Việt Nam.",
    vowels_a: "áàảãạăắằẳẵặâấầẩẫậ",
    vowels_e: "éèẻẽẹêếềểễệ", 
    vowels_i: "íìỉĩị",
    vowels_o: "óòỏõọôốồổỗộơớờởỡợ",
    vowels_u: "úùủũụưứừửữự",
    vowels_y: "ýỳỷỹỵ",
    consonant_d: "đĐ",
    sample_names: "Nguyễn Văn Minh, Trần Thị Hương, Lê Hoàng Phúc",
    sample_address: "123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
    sample_content: "Đây là bài kiểm tra font tiếng Việt với các ký tự đặc biệt"
};

/**
 * Test 1: Basic jsPDF without custom fonts
 */
function testBasicJsPDF() {
    console.log("=== Test 1: Basic jsPDF (No Custom Fonts) ===");
    
    try {
        const doc = new jsPDF();
        doc.setFontSize(12);
        
        let y = 20;
        doc.text("Test 1: Basic jsPDF - Default Font", 20, y);
        y += 15;
        
        Object.entries(vietnameseTestText).forEach(([key, text]) => {
            doc.text(`${key}: ${text}`, 20, y);
            y += 10;
        });
        
        // Check what fonts are available
        const availableFonts = doc.getFontList();
        console.log("Available fonts:", availableFonts);
        
        // Save and open PDF
        window.open(doc.output('bloburl'), '_blank');
        console.log("✓ Basic PDF generated successfully");
        return true;
        
    } catch (error) {
        console.error("✗ Basic PDF test failed:", error);
        return false;
    }
}

/**
 * Test 2: Load and test Arial font
 */
async function testArialFont() {
    console.log("=== Test 2: Arial Font Test ===");
    
    try {
        // Try to load Arial font
        const arialModule = await import('./src/fonts/Arial-Regular.js');
        console.log("✓ Arial font module loaded");
        
        const doc = new jsPDF();
        
        // Add Arial font to jsPDF VFS
        doc.addFileToVFS('Arial-Regular.ttf', arialModule.ArialRegularFont);
        console.log("✓ Arial font added to VFS");
        
        // Register font with jsPDF
        doc.addFont('Arial-Regular.ttf', 'Arial', 'normal');
        console.log("✓ Arial font registered with jsPDF");
        
        // Set font and test
        doc.setFont('Arial');
        doc.setFontSize(12);
        console.log("✓ Arial font set as active font");
        
        let y = 20;
        doc.text("Test 2: Arial Font - Vietnamese Characters", 20, y);
        y += 15;
        
        Object.entries(vietnameseTestText).forEach(([key, text]) => {
            doc.text(`${key}: ${text}`, 20, y);
            y += 10;
        });
        
        // Check current font
        const currentFont = doc.getFont();
        console.log("Current font info:", currentFont);
        
        window.open(doc.output('bloburl'), '_blank');
        console.log("✓ Arial PDF generated successfully");
        return true;
        
    } catch (error) {
        console.error("✗ Arial font test failed:", error);
        return false;
    }
}

/**
 * Test 3: Load and test Times font
 */
async function testTimesFont() {
    console.log("=== Test 3: Times Font Test ===");
    
    try {
        // Try to load Times font
        const timesModule = await import('./src/fonts/Times-Regular.js');
        console.log("✓ Times font module loaded");
        
        const doc = new jsPDF();
        
        // Add Times font to jsPDF VFS
        doc.addFileToVFS('Times-Regular.ttf', timesModule.TimesRegularFont);
        console.log("✓ Times font added to VFS");
        
        // Register font with jsPDF
        doc.addFont('Times-Regular.ttf', 'Times', 'normal');
        console.log("✓ Times font registered with jsPDF");
        
        // Set font and test
        doc.setFont('Times');
        doc.setFontSize(12);
        console.log("✓ Times font set as active font");
        
        let y = 20;
        doc.text("Test 3: Times Font - Vietnamese Characters", 20, y);
        y += 15;
        
        Object.entries(vietnameseTestText).forEach(([key, text]) => {
            doc.text(`${key}: ${text}`, 20, y);
            y += 10;
        });
        
        // Check current font
        const currentFont = doc.getFont();
        console.log("Current font info:", currentFont);
        
        window.open(doc.output('bloburl'), '_blank');
        console.log("✓ Times PDF generated successfully");
        return true;
        
    } catch (error) {
        console.error("✗ Times font test failed:", error);
        return false;
    }
}

/**
 * Test 4: Test FontManager utility
 */
async function testFontManager() {
    console.log("=== Test 4: FontManager Test ===");
    
    try {
        // Try to load FontManager
        const fontManagerModule = await import('./src/utils/FontManager.js');
        const FontManager = fontManagerModule.default;
        console.log("✓ FontManager loaded");
        
        const doc = new jsPDF();
        
        // Test Arial through FontManager
        console.log("Testing FontManager with ARIAL...");
        const arialFontName = FontManager.setVietnameseFont(doc, 'ARIAL', 12);
        console.log("✓ FontManager set Arial font, returned name:", arialFontName);
        
        let y = 20;
        doc.text("Test 4: FontManager - Arial Font", 20, y);
        y += 15;
        
        Object.entries(vietnameseTestText).forEach(([key, text]) => {
            doc.text(`${key}: ${text}`, 20, y);
            y += 10;
        });
        
        window.open(doc.output('bloburl'), '_blank');
        console.log("✓ FontManager Arial PDF generated successfully");
        
        // Test Times through FontManager
        const doc2 = new jsPDF();
        console.log("Testing FontManager with TIMES...");
        const timesFontName = FontManager.setVietnameseFont(doc2, 'TIMES', 12);
        console.log("✓ FontManager set Times font, returned name:", timesFontName);
        
        y = 20;
        doc2.text("Test 4b: FontManager - Times Font", 20, y);
        y += 15;
        
        Object.entries(vietnameseTestText).forEach(([key, text]) => {
            doc2.text(`${key}: ${text}`, 20, y);
            y += 10;
        });
        
        window.open(doc2.output('bloburl'), '_blank');
        console.log("✓ FontManager Times PDF generated successfully");
        
        return true;
        
    } catch (error) {
        console.error("✗ FontManager test failed:", error);
        return false;
    }
}

/**
 * Test 5: Inspect font data and jsPDF internals
 */
async function inspectFontData() {
    console.log("=== Test 5: Font Data Inspection ===");
    
    try {
        // Load Arial font data
        const arialModule = await import('./src/fonts/Arial-Regular.js');
        const arialFontData = arialModule.ArialRegularFont;
        
        console.log("Arial font data type:", typeof arialFontData);
        console.log("Arial font data length:", arialFontData.length);
        console.log("Arial font data starts with:", arialFontData.substring(0, 100));
        
        // Load Times font data  
        const timesModule = await import('./src/fonts/Times-Regular.js');
        const timesFontData = timesModule.TimesRegularFont;
        
        console.log("Times font data type:", typeof timesFontData);
        console.log("Times font data length:", timesFontData.length);
        console.log("Times font data starts with:", timesFontData.substring(0, 100));
        
        // Test jsPDF font handling
        const doc = new jsPDF();
        
        // Check initial VFS
        console.log("Initial jsPDF VFS:", Object.keys(doc.vfs || {}));
        
        // Add Arial font and check VFS
        doc.addFileToVFS('Arial-Regular.ttf', arialFontData);
        console.log("VFS after adding Arial:", Object.keys(doc.vfs || {}));
        
        // Register font and check font list
        doc.addFont('Arial-Regular.ttf', 'Arial', 'normal');
        const fontList = doc.getFontList();
        console.log("Font list after adding Arial:", fontList);
        
        // Test font setting
        doc.setFont('Arial');
        const currentFont = doc.getFont();
        console.log("Current font after setting Arial:", currentFont);
        
        return true;
        
    } catch (error) {
        console.error("✗ Font data inspection failed:", error);
        return false;
    }
}

/**
 * Run all diagnostic tests
 */
async function runDiagnostics() {
    console.log("🔍 Starting Vietnamese Font Diagnostics...\n");
    
    const results = {
        basicPDF: false,
        arialFont: false,
        timesFont: false,
        fontManager: false,
        fontInspection: false
    };
    
    // Run tests sequentially
    results.basicPDF = testBasicJsPDF();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.arialFont = await testArialFont();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.timesFont = await testTimesFont();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.fontManager = await testFontManager();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.fontInspection = await inspectFontData();
    
    // Summary
    console.log("\n📊 Diagnostic Results Summary:");
    console.log("================================");
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✓' : '✗'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const passedCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;
    
    console.log(`\nOverall: ${passedCount}/${totalCount} tests passed`);
    
    if (passedCount === totalCount) {
        console.log("🎉 All tests passed! Vietnamese fonts should be working correctly.");
    } else {
        console.log("⚠️  Some tests failed. Check the detailed logs above for specific issues.");
    }
    
    return results;
}

// Export functions for manual testing
window.vietnameseFontDiagnostics = {
    runDiagnostics,
    testBasicJsPDF,
    testArialFont,
    testTimesFont,
    testFontManager,
    inspectFontData,
    vietnameseTestText
};

// Auto-run diagnostics if this script is loaded directly
if (typeof window !== 'undefined') {
    console.log("Vietnamese Font Diagnostic Script Loaded");
    console.log("Run vietnameseFontDiagnostics.runDiagnostics() to start testing");
}

export { runDiagnostics, testBasicJsPDF, testArialFont, testTimesFont, testFontManager, inspectFontData };
