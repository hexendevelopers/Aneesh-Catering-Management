/**
 * Arabic Font Test for PDF Generation
 * 
 * This file demonstrates how to test Arabic font support
 * before implementing it in your main application.
 */

import jsPDF from 'jspdf';
import { containsArabic, getTextDirection } from './arabic-fonts';

// Test Arabic text detection
export const testArabicDetection = () => {
  const testTexts = [
    'Hello World',
    'مرحبا بالعالم',
    'Hello مرحبا',
    'أحمد محمد',
    'شاورما دجاج',
    '123456789'
  ];

  console.log('🔍 Testing Arabic text detection:');
  testTexts.forEach(text => {
    const isArabic = containsArabic(text);
    const direction = getTextDirection(text);
    console.log(`"${text}" -> Arabic: ${isArabic}, Direction: ${direction}`);
  });
};

// Test PDF generation with Arabic text
export const testArabicPDF = (fontBase64?: string): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Add Arabic font if provided
  if (fontBase64) {
    try {
      doc.addFileToVFS('Amiri-Regular.ttf', fontBase64);
      doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
      console.log('✅ Arabic font loaded successfully');
    } catch (error) {
      console.warn('⚠️ Failed to load Arabic font:', error);
    }
  }

  let y = 20;

  // Test different text types
  const testCases = [
    { text: 'English Text Test', font: 'helvetica', size: 16 },
    { text: 'مرحبا بالعالم', font: 'Amiri', size: 16 },
    { text: 'Mixed Text: Hello مرحبا', font: 'Amiri', size: 14 },
    { text: 'أحمد محمد - Customer Name', font: 'Amiri', size: 12 },
    { text: 'شاورما دجاج - Order Details', font: 'Amiri', size: 12 },
    { text: 'Phone: +966-50-123-4567', font: 'helvetica', size: 10 }
  ];

  testCases.forEach(({ text, font, size }) => {
    try {
      // Set font
      if (font === 'Amiri') {
        try {
          doc.setFont('Amiri', 'normal');
        } catch (error) {
          doc.setFont('helvetica', 'normal');
          console.warn(`⚠️ Fallback to helvetica for: ${text}`);
        }
      } else {
        doc.setFont('helvetica', 'normal');
      }

      doc.setFontSize(size);
      
      // Handle Arabic text alignment
      const isArabic = containsArabic(text);
      const align = isArabic ? 'right' : 'left';
      const x = isArabic ? 190 : 10; // Right-aligned for Arabic, left for English
      
      doc.text(text, x, y, { align });
      
      y += size * 0.6; // Adjust line height
      
    } catch (error) {
      console.error(`❌ Error rendering text "${text}":`, error);
      y += 10; // Move to next line even if text fails
    }
  });

  // Add instructions
  y += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  
  const instructions = [
    'Instructions for Arabic Font Setup:',
    '1. Download Amiri or Cairo font (.ttf)',
    '2. Convert to base64 using the provided script',
    '3. Update arabic-fonts.ts with the base64 string',
    '4. Test with this function',
    '5. Integrate into your main PDF generation'
  ];

  instructions.forEach(instruction => {
    doc.text(instruction, 10, y, { align: 'left' });
    y += 6;
  });

  return doc;
};

// Quick test function
export const quickTest = () => {
  console.log('🧪 Running Arabic font tests...');
  testArabicDetection();
  
  // Test PDF generation without font (will use fallbacks)
  const doc = testArabicPDF();
  
  console.log('📄 PDF generated successfully!');
  console.log('💡 To test with Arabic fonts, provide fontBase64 parameter');
  
  return doc;
};

// Export for use in other files
export default {
  testArabicDetection,
  testArabicPDF,
  quickTest
};
