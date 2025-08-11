/**
 * Arabic Font Demo - Test Arabic text rendering
 * 
 * This file demonstrates how to test Arabic font support
 * and provides a working example for troubleshooting.
 */

import jsPDF from 'jspdf';
import { containsArabic, hasArabicFonts } from './arabic-fonts';

// Test function to check current Arabic font status
export const checkArabicFontStatus = () => {
  console.log('🔍 Checking Arabic font status...');
  console.log(`Has Arabic fonts: ${hasArabicFonts()}`);
  
  // Test Arabic text detection
  const testTexts = [
    'Hello World',
    'مرحبا بالعالم',
    'أحمد محمد',
    'شاورما دجاج'
  ];
  
  testTexts.forEach(text => {
    const isArabic = containsArabic(text);
    console.log(`"${text}" -> Arabic: ${isArabic}`);
  });
};

// Generate a test PDF to see what's happening
export const generateTestPDF = (): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  let y = 20;
  
  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Arabic Font Test PDF', 105, y, { align: 'center' });
  y += 20;
  
  // Status
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Arabic fonts available: ${hasArabicFonts()}`, 20, y);
  y += 15;
  
  // Test texts
  const testCases = [
    { text: 'English Text:', font: 'helvetica' },
    { text: 'مرحبا بالعالم', font: 'helvetica' },
    { text: 'أحمد محمد', font: 'helvetica' },
    { text: 'شاورما دجاج', font: 'helvetica' }
  ];
  
  testCases.forEach(({ text, font }) => {
    try {
      doc.setFont(font, 'normal');
      doc.setFontSize(10);
      
      // Check if text contains Arabic
      const isArabic = containsArabic(text);
      const status = isArabic ? 'ARABIC' : 'ENGLISH';
      
      doc.text(`${status}: ${text}`, 20, y);
      y += 10;
      
    } catch (error) {
      console.error(`Error rendering "${text}":`, error);
      y += 10;
    }
  });
  
  // Instructions
  y += 20;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  
  const instructions = [
    'If Arabic text shows as boxes or garbled characters:',
    '1. Download Amiri font (.ttf) from GitHub',
    '2. Convert to base64 using the script',
    '3. Update arabic-fonts.ts file',
    '4. Restart your application'
  ];
  
  instructions.forEach(instruction => {
    doc.text(instruction, 20, y);
    y += 6;
  });
  
  return doc;
};

// Quick test function
export const runQuickTest = () => {
  console.log('🧪 Running Arabic font quick test...');
  
  checkArabicFontStatus();
  
  if (!hasArabicFonts()) {
    console.log('\n❌ NO ARABIC FONTS AVAILABLE');
    console.log('This is why Arabic text shows as garbled characters!');
    console.log('\n🔧 To fix this:');
    console.log('1. Download Amiri font from: https://github.com/alif-type/amiri/releases');
    console.log('2. Place the .ttf file in your project');
    console.log('3. Run: node scripts/convert-font-to-base64.js fonts/Amiri-Regular.ttf');
    console.log('4. Copy the base64 string to src/lib/arabic-fonts.ts');
    console.log('5. Restart your application');
  } else {
    console.log('\n✅ Arabic fonts are available!');
    console.log('If text still shows as garbled, check the font loading logic.');
  }
  
  return generateTestPDF();
};

export default {
  checkArabicFontStatus,
  generateTestPDF,
  runQuickTest
};
