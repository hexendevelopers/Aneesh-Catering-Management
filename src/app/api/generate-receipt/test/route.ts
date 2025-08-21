import puppeteer from 'puppeteer';

export async function GET() {
  try {
    console.log('=== TESTING RECEIPT GENERATION API ===');

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport for better rendering
    await page.setViewport({ width: 800, height: 600 });

    // Sample test order data
    const testOrder = {
      receiptNo: 'TEST001',
      orderId: 'TEST001',
      name: 'Test Customer',
      orderDetails: 'Test Order with Arabic text - طلب تجريبي',
      phoneNumber: '+968 1234 5678',
      deliveryType: 'Delivery',
      date: '2025-01-21',
      time: '14:30',
      cookStatus: 'completed',
      totalPayment: '25.500',
      advancePayment: '10.000',
      balancePayment: '15.500',
      paymentType: 'cash',
      address: 'Muscat, Oman - مسقط، عمان'
    };

    // Simple test HTML with Arabic text
    const testHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>Test Receipt</title>
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Amiri', serif;
            font-size: 16px;
            padding: 30px;
            background: #ffffff;
            color: #1e293b;
            text-align: center;
            direction: rtl;
          }
          .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .logo-placeholder {
            width: 100px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px dashed rgba(255, 255, 255, 0.5);
            border-radius: 8px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: rgba(255, 255, 255, 0.8);
          }
          .receipt-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .receipt-number {
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            display: inline-block;
          }
          .content {
            padding: 20px;
          }
          .info-item {
            background: #f8fafc;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            text-align: right;
          }
          .info-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 5px;
            font-weight: bold;
          }
          .info-value {
            font-size: 14px;
            color: #1f2937;
          }
          .amount {
            font-size: 18px;
            font-weight: bold;
            color: #059669;
          }
          .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .thank-you {
            font-size: 16px;
            color: #2563eb;
            font-weight: bold;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="logo-placeholder">شعار الشركة</div>
            <h1 class="receipt-title">إيصال</h1>
            <div class="receipt-number">رقم الإيصال: ${testOrder.receiptNo}</div>
          </div>
          
          <div class="content">
            <div class="info-item">
              <div class="info-label">العميل</div>
              <div class="info-value">${testOrder.name}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">رقم الهاتف</div>
              <div class="info-value">${testOrder.phoneNumber}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">العنوان</div>
              <div class="info-value">${testOrder.address}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">تفاصيل الطلب</div>
              <div class="info-value">${testOrder.orderDetails}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">التاريخ</div>
              <div class="info-value">${testOrder.date}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">الوقت</div>
              <div class="info-value">${testOrder.time}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">نوع التوصيل</div>
              <div class="info-value">${testOrder.deliveryType}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">الحالة</div>
              <div class="info-value">مكتمل</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">المبلغ الإجمالي</div>
              <div class="info-value amount">${testOrder.totalPayment} ر.ع.</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">الدفعة المقدمة</div>
              <div class="info-value">${testOrder.advancePayment} ر.ع.</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">المبلغ المتبقي</div>
              <div class="info-value">${testOrder.balancePayment} ر.ع.</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">نوع الدفع</div>
              <div class="info-value">نقدي</div>
            </div>
          </div>
          
          <div class="footer">
            <div class="thank-you">شكراً لك على طلبك!</div>
            <div style="font-size: 11px; color: #6b7280;">تم إنشاء هذا الإيصال تلقائياً</div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Set the HTML content
    await page.setContent(testHTML, {
      waitUntil: 'networkidle0'
    });

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');
    await page.waitForFunction(
      () => {
        return document.fonts.status === 'loaded';
      },
      { timeout: 10000 }
    );

    // Additional wait using evaluate
    await page.evaluate(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15px',
        right: '15px',
        bottom: '15px',
        left: '15px'
      }
    });

    await browser.close();

    console.log('Test receipt PDF generated successfully');

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=test-receipt.pdf'
      }
    });
  } catch (error) {
    console.error('Error generating test receipt PDF:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate test receipt PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
