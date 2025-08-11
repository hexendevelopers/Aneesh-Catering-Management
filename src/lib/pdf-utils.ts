import jsPDF from 'jspdf';
import { containsArabic, getTextDirection, hasArabicFonts, getAvailableArabicFont } from './arabic-fonts';

export interface OrderWithStatus {
  receiptNo?: string;
  orderId?: string;
  name?: string;
  orderDetails?: string;
  phoneNumber?: string;
  deliveryType?: 'Delivery' | 'Pickup' | string;
  date?: string;
  time?: string;
  status?: 'completed' | 'pending' | 'cancelled' | string;
  totalPayment?: string;
  totalAmount?: number; // Added for compatibility with existing components
  advancePayment?: string;
  balancePayment?: string;
  discount?: string;
  location?: string;
  paymentType?: 'cash' | 'atm' | 'transfer' | string;
  cookStatus?: 'pending' | 'preparing' | 'ready' | 'delivered' | string;
  address?: string;
}

export interface PDFOptions {
  title: string;
  orders: OrderWithStatus[];
  language: 'ar' | 'en';
  showSummary?: boolean;
  logoUrl?: string;
}

interface PDFConfig {
  pageWidth: number;
  pageHeight: number;
  margin: number;
  colors: {
    primary: [number, number, number];
    secondary: [number, number, number];
    text: [number, number, number];
    border: [number, number, number];
    headerBg: [number, number, number];
    alternateRow: [number, number, number];
  };
  fonts: {
    title: number;
    header: number;
    body: number;
    small: number;
  };
}

interface TableColumn {
  header: string;
  dataKey: keyof OrderWithStatus;
  width: number;
  align?: 'left' | 'center' | 'right';
}

// Helper function to get English text
const getEnglishText = (): Record<string, string> => {
  return {
    'title': 'طلبات اليوم',
    'generatedOn': 'Generated on',
    'noOrders': 'No orders to display',
    'receiptNo': 'Receipt No',
    'customer': 'Customer',
    'orderDetails': 'Order Details',
    'phoneNumber': 'Phone Number',
    'deliveryType': 'Delivery Type',
    'date': 'Date',
    'time': 'Time'
  };
};

export const generateOrdersPDF = ({ 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title, 
  orders, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  language = 'en', 
  showSummary = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  logoUrl 
}: PDFOptions): jsPDF => {
  // Create new PDF document with UTF-8 support
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true
  });

  // Initialize Arabic font support
  const initializeArabicFonts = () => {
    try {
      if (hasArabicFonts()) {
        const arabicFont = getAvailableArabicFont();
        if (arabicFont) {
          const fontFileName = `${arabicFont.name}-Regular.ttf`;
          doc.addFileToVFS(fontFileName, arabicFont.base64);
          doc.addFont(fontFileName, arabicFont.name, 'normal');
          // eslint-disable-next-line no-console
          console.log(`✅ Arabic font '${arabicFont.name}' loaded successfully`);
        }
      } else {
        // eslint-disable-next-line no-console
        console.warn('⚠️ No Arabic fonts available. Arabic text will not render properly.');
        // eslint-disable-next-line no-console
        console.warn('💡 To fix this:');
        // eslint-disable-next-line no-console
        console.warn('   1. Download Amiri font from: https://github.com/alif-type/amiri/releases');
        // eslint-disable-next-line no-console
        console.warn('   2. Convert using: node scripts/convert-font-to-base64.js fonts/Amiri-Regular.ttf');
        // eslint-disable-next-line no-console
        console.warn('   3. Update src/lib/arabic-fonts.ts with the base64 string');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Failed to initialize Arabic fonts:', error);
    }
  };

  // Initialize fonts
  initializeArabicFonts();



  // Configuration object for consistent styling
  const config: PDFConfig = {
    pageWidth: doc.internal.pageSize.getWidth(),
    pageHeight: doc.internal.pageSize.getHeight(),
    margin: 15,
    colors: {
      primary: [37, 99, 235],      // Blue
      secondary: [100, 116, 139],  // Gray
      text: [30, 41, 59],          // Dark gray
      border: [226, 232, 240],     // Light gray
      headerBg: [248, 250, 252],   // Very light gray
      alternateRow: [249, 250, 251] // Alternate row color
    },
    fonts: {
      title: 20,
      header: 14,
      body: 10,
      small: 8
    }
  };

  let currentY = config.margin;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let currentPageNumber = 1;

  // Helper function to add a new page if needed
  const checkAndAddPage = (requiredHeight: number): boolean => {
    if (currentY + requiredHeight > config.pageHeight - config.margin - 10) {
      doc.addPage();
      currentY = config.margin;
      currentPageNumber++;
      return true;
    }
    return false;
  };

  // Helper function to set colors
  const setColor = (colorArray: [number, number, number], type: 'text' | 'fill' | 'draw') => {
    const [r, g, b] = colorArray;
    switch (type) {
      case 'text':
        doc.setTextColor(r, g, b);
        break;
      case 'fill':
        doc.setFillColor(r, g, b);
        break;
      case 'draw':
        doc.setDrawColor(r, g, b);
        break;
    }
  };

  // Helper function to add text with proper styling
  const addText = (
    text: string, 
    x: number, 
    y: number, 
    options: {
      align?: 'left' | 'center' | 'right';
      maxWidth?: number;
      fontSize?: number;
      fontStyle?: 'normal' | 'bold';
      color?: [number, number, number];
    } = {}
  ): number => {
    const { 
      align = 'center',
      maxWidth, 
      fontSize = config.fonts.body,
      fontStyle = 'normal',
      color = config.colors.text
    } = options;

    doc.setFontSize(fontSize);
    
    // Handle Arabic text with appropriate font and alignment
    const isArabic = containsArabic(text);
    const textDirection = getTextDirection(text);
    
    try {
      if (isArabic) {
        // Use Arabic font if available
        try {
          doc.setFont('Amiri', fontStyle);
        } catch (error) {
          // Fallback to helvetica if Arabic font not available
          doc.setFont('helvetica', fontStyle);
        }
        
        // Adjust alignment for RTL text
        let adjustedAlign = align;
        if (textDirection === 'rtl') {
          if (align === 'left') adjustedAlign = 'right';
          else if (align === 'right') adjustedAlign = 'left';
        }
        
        // Adjust x position for RTL text
        let adjustedX = x;
        if (textDirection === 'rtl' && maxWidth) {
          if (adjustedAlign === 'right') {
            adjustedX = x + maxWidth;
          } else if (adjustedAlign === 'left') {
            adjustedX = x + maxWidth;
          }
        }
        
        setColor(color, 'text');
        
        let finalText = text;
        if (maxWidth) {
          const lines = doc.splitTextToSize(finalText, maxWidth);
          finalText = Array.isArray(lines) ? lines[0] : lines;
          if (Array.isArray(lines) && lines.length > 1) {
            finalText += '...';
          }
        }
        
        try {
          doc.text(finalText, adjustedX, y, { align: adjustedAlign });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('Arabic text rendering failed:', error);
          // Fallback: use simple text without special options
          doc.text(finalText, adjustedX, y);
        }
      } else {
        // Handle non-Arabic text normally
        doc.setFont('helvetica', fontStyle);
        setColor(color, 'text');
        
        let finalText = text;
        if (maxWidth) {
          const lines = doc.splitTextToSize(finalText, maxWidth);
          finalText = Array.isArray(lines) ? lines[0] : lines;
          if (Array.isArray(lines) && lines.length > 1) {
            finalText += '...';
          }
        }
        
        try {
          doc.text(finalText, x, y, { align });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('Text rendering failed:', error);
          // Fallback: use simple text without special options
          doc.text(finalText, x, y);
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Font setting failed, using default');
      doc.setFont('helvetica', fontStyle);
      setColor(color, 'text');
      doc.text(text, x, y);
    }
    
    return fontSize * 0.35;
  };

  // Header section - Always show English text
  const addHeader = () => {
    const englishText = getEnglishText();
    
    // Main title
    addText(englishText.title, config.pageWidth / 2, currentY, {
      align: 'center',
      fontSize: config.fonts.title,
      fontStyle: 'bold',
      color: config.colors.primary
    });
    currentY += 15;

    // Subtitle with date and time
    const now = new Date();
    const dateTimeStr = now.toLocaleDateString('en-US') + ' ' + now.toLocaleTimeString('en-US');
    const generatedText = `${englishText.generatedOn}: ${dateTimeStr}`;
    
    addText(generatedText, config.pageWidth / 2, currentY, {
      align: 'center',
      fontSize: config.fonts.small,
      color: config.colors.secondary
    });
    currentY += 10;

    // Separator line
    setColor(config.colors.border, 'draw');
    doc.setLineWidth(0.5);
    doc.line(config.margin, currentY, config.pageWidth - config.margin, currentY);
    currentY += 10;
  };

  // Custom table implementation with Arabic support
  const addOrdersTable = () => {
    if (orders.length === 0) {
      const englishText = getEnglishText();
      
      addText(englishText.noOrders, config.pageWidth / 2, currentY + 20, {
        align: 'center',
        fontSize: config.fonts.header,
        color: config.colors.secondary
      });
      return;
    }

    // Define columns - Always use English headers
    const columns: TableColumn[] = [
      { header: 'Receipt No', dataKey: 'receiptNo', width: 28 },
      { header: 'Customer', dataKey: 'name', width: 32 },
      { header: 'Order Details', dataKey: 'orderDetails', width: 45 },
      { header: 'Phone Number', dataKey: 'phoneNumber', width: 30 },
      { header: 'Delivery Type', dataKey: 'deliveryType', width: 30 },
      { header: 'Date', dataKey: 'date', width: 28 },
      { header: 'Time', dataKey: 'time', width: 25 }
    ];

    const tableStartX = config.margin;
    const rowHeight = 8;
    const headerHeight = 10;

    // Function to draw table header
    const drawTableHeader = (startY: number): number => {
      let x = tableStartX;
      
      // Header background
      setColor(config.colors.headerBg, 'fill');
      doc.rect(tableStartX, startY - 2, 
        columns.reduce((sum, col) => sum + col.width, 0), 
        headerHeight, 'F');

      // Header borders
      setColor(config.colors.border, 'draw');
      doc.setLineWidth(0.3);
      
      // Draw vertical lines and headers
      columns.forEach((col) => {
        // Vertical line
        doc.line(x, startY - 2, x, startY + headerHeight - 2);
        
        // Header text
        addText(col.header, x + col.width / 2, startY + 4, {
          align: 'center',
          fontSize: config.fonts.body,
          fontStyle: 'bold',
          color: config.colors.text,
          maxWidth: col.width - 4
        });
        
        x += col.width;
      });
      
      // Final vertical line
      doc.line(x, startY - 2, x, startY + headerHeight - 2);
      
      // Horizontal lines
      doc.line(tableStartX, startY - 2, x, startY - 2); // Top
      doc.line(tableStartX, startY + headerHeight - 2, x, startY + headerHeight - 2); // Bottom
      
      return startY + headerHeight;
    };

    // Function to draw table row
    const drawTableRow = (order: OrderWithStatus, startY: number, isAlternate: boolean): number => {
      let x = tableStartX;
      
      // Row background for alternate rows
      if (isAlternate) {
        setColor(config.colors.alternateRow, 'fill');
        doc.rect(tableStartX, startY - 2, 
          columns.reduce((sum, col) => sum + col.width, 0), 
          rowHeight, 'F');
      }

      // Row borders
      setColor(config.colors.border, 'draw');
      doc.setLineWidth(0.1);
      
      columns.forEach(col => {
        // Vertical line
        doc.line(x, startY - 2, x, startY + rowHeight - 2);
        
        // Cell data
        let cellData = '';
        const value = order[col.dataKey];
        
        if (col.dataKey === 'totalPayment' && typeof value === 'string') {
          cellData = value;
        } else if (col.dataKey === 'receiptNo') {
          cellData = (order.receiptNo || order.orderId || 'N/A').toString();
        } else {
          cellData = (value || 'N/A').toString();
        }
        
        // Truncate long text and handle Arabic content
        if (cellData.length > 30) {
          cellData = cellData.substring(0, 27) + '...';
        }
        
        // Clean the text for display
        cellData = cellData.replace(/[^\x20-\x7E\u0600-\u06FF]/g, ' ').trim();
        
        const textX = col.align === 'center' ? x + col.width / 2 :
                     col.align === 'right' ? x + col.width - 2 :
                     x + 2;
        
        addText(cellData, textX, startY + 3, {
          align: col.align || 'left',
          fontSize: config.fonts.body - 1,
          color: config.colors.text,
          maxWidth: col.width - 4
        });
        
        x += col.width;
      });
      
      // Final vertical line and bottom border
      doc.line(x, startY - 2, x, startY + rowHeight - 2);
      doc.line(tableStartX, startY + rowHeight - 2, x, startY + rowHeight - 2);
      
      return startY + rowHeight;
    };

    // Draw table
    let tableY = currentY;
    
    // Check if header fits, if not start new page
    if (checkAndAddPage(headerHeight + rowHeight * 3)) {
      tableY = currentY;
    }
    
    // Draw header
    tableY = drawTableHeader(tableY);
    
    // Draw rows
    orders.forEach((order, index) => {
      // Check if row fits, if not add new page with header
      if (checkAndAddPage(rowHeight + 5)) {
        tableY = drawTableHeader(currentY);
      }
      
      tableY = drawTableRow(order, tableY, index % 2 === 1);
    });
    
    currentY = tableY + 10;
  };

  // Summary section (disabled by default)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addSummary = () => {
    if (!showSummary || orders.length === 0) return;

    checkAndAddPage(50);

    // Separator line
    setColor(config.colors.border, 'draw');
    doc.setLineWidth(0.5);
    doc.line(config.margin, currentY, config.pageWidth - config.margin, currentY);
    currentY += 15;

    // Summary title
    const summaryTitle = 'Order Summary';
    
            addText(summaryTitle, config.margin, currentY, {
          fontSize: config.fonts.header,
          fontStyle: 'bold',
          color: config.colors.primary
        });
    currentY += 15;

    // Calculate statistics
    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, order) => 
      sum + (parseFloat(order.totalPayment || '0') || 0), 0
    );
    const avgAmount = totalOrders > 0 ? totalAmount / totalOrders : 0;

    // Status breakdown
    const statusCounts = orders.reduce((acc, order) => {
      const status = order.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Summary items in two columns
    const leftColumnX = config.margin;
    const rightColumnX = config.pageWidth / 2;
    let leftY = currentY;
    let rightY = currentY;

    // Left column - Basic stats
    const basicStats = [
      `Total Orders: ${totalOrders}`,
      `Total Amount: ${totalAmount.toFixed(2)}`,
      `Average Amount: ${avgAmount.toFixed(2)}`
    ];

    basicStats.forEach(item => {
              addText(item, leftColumnX, leftY, {
          fontSize: config.fonts.body,
          color: config.colors.text
        });
      leftY += 8;
    });

          // Right column - Status breakdown
      if (Object.keys(statusCounts).length > 0) {
        const statusTitle = 'Status Breakdown:';
      
              addText(statusTitle, rightColumnX, rightY, {
          fontSize: config.fonts.body,
          fontStyle: 'bold',
          color: config.colors.text
        });
      rightY += 10;

      Object.entries(statusCounts).forEach(([status, count]) => {
        addText(`${status}: ${count}`, rightColumnX + 10, rightY, {
          fontSize: config.fonts.body - 1,
          color: config.colors.secondary
        });
        rightY += 7;
      });
    }

    currentY = Math.max(leftY, rightY) + 10;
  };

  // Footer with page numbers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addFooter = () => {
    const totalPages = doc.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      const footerY = config.pageHeight - config.margin + 5;
      
              // Page number
        const pageText = `Page ${i} of ${totalPages}`;
      
              addText(pageText, config.pageWidth - config.margin, footerY, {
          align: 'right',
          fontSize: config.fonts.small,
          color: config.colors.secondary
        });
      
      // Footer line
      setColor(config.colors.border, 'draw');
      doc.setLineWidth(0.3);
      doc.line(config.margin, footerY - 3, config.pageWidth - config.margin, footerY - 3);
    }
  };

  // Generate PDF content
  addHeader();
  addOrdersTable();
  // addSummary(); // Disabled by default
  // addFooter(); // Disabled by default

  return doc;
};

export const downloadOrdersPDF = ({ 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title, 
  orders, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  language = 'en', 
  showSummary = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  logoUrl 
}: PDFOptions): void => {
  try {
    const doc = generateOrdersPDF({ title, orders, language, showSummary, logoUrl });
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    
    const fileName = `${sanitizedTitle}-${timestamp}.pdf`;
    
    doc.save(fileName);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating PDF:', error);
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

// Utility function to preview PDF (returns base64 data URL)
export const previewOrdersPDF = ({ 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title, 
  orders, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  language = 'en', 
  showSummary = false 
}: Omit<PDFOptions, 'logoUrl'>): string => {
  const doc = generateOrdersPDF({ title, orders, language, showSummary });
  return doc.output('datauristring');
};

// Generate individual order receipt PDF
export const generateOrderReceiptPDF = async (order: OrderWithStatus): Promise<jsPDF> => {
  // Create new PDF document for receipt
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true
  });

  // Initialize Arabic font support
  const initializeArabicFonts = () => {
    try {
      if (hasArabicFonts()) {
        const arabicFont = getAvailableArabicFont();
        if (arabicFont) {
          const fontFileName = `${arabicFont.name}-Regular.ttf`;
          doc.addFileToVFS(fontFileName, arabicFont.base64);
          doc.addFont(fontFileName, arabicFont.name, 'normal');
        }
      }
          } catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ Failed to initialize Arabic fonts:', error);
      }
  };

  // Initialize fonts
  initializeArabicFonts();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15; // Reduced margin for better fit
  let currentY = margin;

  // Helper function to add text with proper styling
  const addText = (
    text: string, 
    x: number, 
    y: number, 
    options: {
      align?: 'left' | 'center' | 'right';
      maxWidth?: number;
      fontSize?: number;
      fontStyle?: 'normal' | 'bold';
      color?: [number, number, number];
    } = {}
  ): number => {
    const { 
      align = 'left',
      maxWidth, 
      fontSize = 12,
      fontStyle = 'normal',
      color = [0, 0, 0]
    } = options;

    doc.setFontSize(fontSize);
    
    // Handle Arabic text with appropriate font and alignment
    const isArabic = containsArabic(text);
    const textDirection = getTextDirection(text);
    
    try {
      if (isArabic) {
        // Use Arabic font if available
        try {
          doc.setFont('Amiri', fontStyle);
        } catch (error) {
          doc.setFont('helvetica', fontStyle);
        }
        
        // Adjust alignment for RTL text
        let adjustedAlign = align;
        if (textDirection === 'rtl') {
          if (align === 'left') adjustedAlign = 'right';
          else if (align === 'right') adjustedAlign = 'left';
        }
        
        doc.setTextColor(color[0], color[1], color[2]);
        
        let finalText = text;
        if (maxWidth) {
          const lines = doc.splitTextToSize(finalText, maxWidth);
          finalText = Array.isArray(lines) ? lines[0] : lines;
          if (Array.isArray(lines) && lines.length > 1) {
            finalText += '...';
          }
        }
        
        doc.text(finalText, x, y, { align: adjustedAlign });
      } else {
        // Handle non-Arabic text normally
        doc.setFont('helvetica', fontStyle);
        doc.setTextColor(color[0], color[1], color[2]);
        
        let finalText = text;
        if (maxWidth) {
          const lines = doc.splitTextToSize(finalText, maxWidth);
          finalText = Array.isArray(lines) ? lines[0] : lines;
          if (Array.isArray(lines) && lines.length > 1) {
            finalText += '...';
          }
        }
        
        doc.text(finalText, x, y, { align });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Font setting failed, using default');
      doc.setFont('helvetica', fontStyle);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(text, x, y);
    }
    
    return fontSize * 0.35;
  };

  // Header Image
  try {
    // Convert image to base64 for reliable PDF embedding
    const base64Image = await convertImageToBase64('/assets/images/invoice header.png');
    
    // Add the invoice header image
    const imgWidth = pageWidth - 2 * margin; // Full width minus margins
    const imgHeight = 35; // Reduced height for better fit
    
    // Center the image horizontally
    const imgX = margin;
    const imgY = currentY;
    
    // Add base64 image to PDF
    doc.addImage(base64Image, 'PNG', imgX, imgY, imgWidth, imgHeight);
    currentY += imgHeight + 15; // Reduced space after image
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load header image, using text fallback:', error);
    // Fallback to text header if image fails
    addText('RECEIPT', pageWidth / 2, currentY, {
      align: 'center',
      fontSize: 20, // Reduced font size
      fontStyle: 'bold',
     });
    currentY += 15; // Reduced space
  }

  // Receipt number and date in two columns
  const leftColX = margin;
  const rightColX = pageWidth / 2;
  
  // Add subtle background to header section
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, currentY - 5, pageWidth - 2 * margin, 25, 'F');
  
  // Left column - Receipt number
  addText(`Receipt No: ${order.receiptNo || order.orderId || 'N/A'}`, leftColX, currentY, {
    fontSize: 12,
    fontStyle: 'bold'
  });
  
  // Right column - Date and time
  addText(`Date: ${order.date || 'N/A'}`, rightColX, currentY);
  currentY += 8;
  addText(`Time: ${order.time || 'N/A'}`, rightColX, currentY);
  currentY += 15;

  // Customer information
  addText('Customer Information:', margin, currentY, {
    fontSize: 14,
    fontStyle: 'bold',
    color: [37, 99, 235]
  });
  currentY += 10;

  // Customer details in two columns for better space usage
  addText(`Name: ${order.name || 'N/A'}`, leftColX, currentY);
  addText(`Phone: ${order.phoneNumber || 'N/A'}`, rightColX, currentY);
  currentY += 8;
  
  if (order.address) {
    addText(`Address: ${order.address}`, leftColX, currentY);
    currentY += 8;
  }

  if (order.location) {
    addText(`Location: ${order.location}`, rightColX, currentY);
    currentY += 8;
  }

  currentY += 12;

  // Order details
  addText('Order Details:', margin, currentY, {
    fontSize: 14,
    fontStyle: 'bold',
    color: [37, 99, 235]
  });
  currentY += 10;

  addText(order.orderDetails || 'N/A', margin, currentY, {
    maxWidth: pageWidth - 2 * margin
  });
  currentY += 15;

  // Delivery information
  addText('Delivery Information:', margin, currentY, {
    fontSize: 14,
    fontStyle: 'bold',
    color: [37, 99, 235]
  });
  currentY += 10;

  // Delivery details in two columns
  addText(`Type: ${order.deliveryType || 'N/A'}`, leftColX, currentY);
  currentY += 15;

  // Payment information
  addText('Payment Information:', margin, currentY, {
    fontSize: 14,
    fontStyle: 'bold',
    color: [37, 99, 235]
  });
  currentY += 10;

  // Payment details in two columns for better space usage
  addText(`Total Amount: OMR ${order.totalPayment || '0.000'}`, leftColX, currentY, {
    fontSize: 14,
    fontStyle: 'bold',
    color: [37, 99, 235]
  });
  
  if (order.paymentType) {
    addText(`Payment Type: ${order.paymentType.toUpperCase()}`, rightColX, currentY);
  }
  currentY += 8;

  if (order.advancePayment && parseFloat(order.advancePayment) > 0) {
    addText(`Advance Payment: OMR ${order.advancePayment}`, leftColX, currentY);
    currentY += 8;
  }

  if (order.balancePayment && parseFloat(order.balancePayment) > 0) {
    addText(`Balance Payment: OMR ${order.balancePayment}`, rightColX, currentY);
    currentY += 8;
  }

  if (order.discount && parseFloat(order.discount) > 0) {
    addText(`Discount: OMR ${order.discount}`, leftColX, currentY);
    currentY += 8;
  }

  currentY += 8;

  // Footer section
  const footerY = pageHeight - margin - 20;
  
  // Add a separator line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 15, pageWidth - margin, footerY - 15);
  
  // Footer text
  addText('Thank you for your order!', pageWidth / 2, footerY - 5, {
    align: 'center',
    fontSize: 10,
    color: [100, 100, 100]
  });

  return doc;
};

// Utility function to convert image to base64
const convertImageToBase64 = (imagePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imagePath;
  });
};

// Download individual order receipt
export const downloadOrderReceipt = async (order: OrderWithStatus): Promise<void> => {
  try {
    const doc = await generateOrderReceiptPDF(order);
    
    // Generate filename
    const receiptNo = order.receiptNo || order.orderId || 'receipt';
    const customerName = order.name || 'customer';
    const sanitizedName = customerName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
    const fileName = `receipt-${receiptNo}-${sanitizedName}.pdf`;
    
    doc.save(fileName);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating receipt PDF:', error);
    throw new Error(
      `Failed to generate receipt PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

// Export configuration for customization
export const PDFDefaults = {
  language: 'en' as const,
  showSummary: false,
  orientation: 'landscape' as const,
  format: 'a4' as const
};