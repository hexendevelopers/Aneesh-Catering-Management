import jsPDF from 'jspdf';
import { OrderWithStatus } from '@/services/dashboardService';

interface PDFOptions {
  title: string;
  orders: OrderWithStatus[];
  language: string;
}

export const generateOrdersPDF = ({ title, orders, language }: PDFOptions) => {
  // Create new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Set font for better Unicode support
  doc.setFont('helvetica');

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const titleText = title;
  const titleWidth = doc.getTextWidth(titleText);
  doc.text(titleText, (pageWidth - titleWidth) / 2, yPosition);
  yPosition += 20;

  // Date and time
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
  const timeStr = new Date().toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US');
  const dateTimeText = `${language === 'ar' ? 'التاريخ' : 'Generated on'}: ${dateStr} ${timeStr}`;
  doc.text(dateTimeText, margin, yPosition);
  yPosition += 15;

  // Add line separator
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  if (orders.length === 0) {
    doc.setFontSize(12);
    const noOrdersText = language === 'ar' ? 'لا توجد طلبات' : 'No orders found';
    const noOrdersWidth = doc.getTextWidth(noOrdersText);
    doc.text(noOrdersText, (pageWidth - noOrdersWidth) / 2, yPosition + 20);
  } else {
    // Table headers
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    const headers = language === 'ar' 
      ? ['رقم الطلب', 'اسم العميل', 'تفاصيل الطلب', 'المبلغ', 'الحالة', 'التاريخ']
      : ['Order #', 'Customer', 'Order Details', 'Amount', 'Status', 'Date'];
    
    const colWidths = [25, 35, 50, 25, 25, 25];
    let xPosition = margin;
    
    // Draw headers
    headers.forEach((header, index) => {
      doc.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });
    yPosition += 8;

    // Line under headers
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    // Order rows
    doc.setFont('helvetica', 'normal');
    
    orders.forEach((order, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }

      xPosition = margin;
      const rowData = [
        order.receiptNo || order.orderId,
        order.name || 'N/A',
        order.orderDetails?.substring(0, 30) + (order.orderDetails?.length > 30 ? '...' : '') || 'N/A',
        `${parseFloat(order.totalPayment || '0').toFixed(3)} OMR`,
        order.displayStatus || 'N/A',
        order.date || 'N/A'
      ];

      // Draw row data
      rowData.forEach((data, colIndex) => {
        // Handle text wrapping for long content
        const lines = doc.splitTextToSize(data, colWidths[colIndex] - 2);
        doc.text(lines[0], xPosition, yPosition);
        xPosition += colWidths[colIndex];
      });

      yPosition += 12;

      // Add subtle line between rows
      if (index < orders.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.line(margin, yPosition - 6, pageWidth - margin, yPosition - 6);
        doc.setDrawColor(0, 0, 0);
      }
    });

    // Summary section
    yPosition += 10;
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    doc.setFont('helvetica', 'bold');
    const totalAmount = orders.reduce((sum, order) => sum + parseFloat(order.totalPayment || '0'), 0);
    const summaryText = language === 'ar' 
      ? `إجمالي الطلبات: ${orders.length} | إجمالي المبلغ: ${totalAmount.toFixed(3)} ر.ع.`
      : `Total Orders: ${orders.length} | Total Amount: ${totalAmount.toFixed(3)} OMR`;
    
    doc.text(summaryText, margin, yPosition);
  }

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const footerText = language === 'ar' 
    ? 'أنعش للمأكولات - نظام إدارة المطبخ'
    : 'Aneesh Catering - Kitchen Management System';
  const footerWidth = doc.getTextWidth(footerText);
  doc.text(footerText, (pageWidth - footerWidth) / 2, footerY);

  return doc;
};

export const downloadOrdersPDF = ({ title, orders, language }: PDFOptions) => {
  try {
    const doc = generateOrdersPDF({ title, orders, language });
    const fileName = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};
