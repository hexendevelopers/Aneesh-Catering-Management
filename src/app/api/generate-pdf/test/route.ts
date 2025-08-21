import puppeteer from 'puppeteer';

export async function GET() {
  try {
    console.log('=== TESTING PUPPETEER API ROUTE ===');

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport for better rendering
    await page.setViewport({ width: 1200, height: 800 });

    // Simple test HTML with Arabic text
    const testHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>Test Arabic PDF</title>
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Amiri', serif;
            font-size: 24px;
            padding: 40px;
            background: #ffffff;
            color: #1e293b;
            text-align: center;
            direction: rtl;
          }
          .title {
            color: #2563eb;
            margin-bottom: 30px;
            font-weight: bold;
          }
          .subtitle {
            color: #64748b;
            margin-bottom: 20px;
          }
          .test-text {
            margin: 15px 0;
            padding: 10px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            background: #f8fafc;
          }
        </style>
      </head>
      <body>
        <h1 class="title">اختبار إنشاء PDF باللغة العربية</h1>
        <div class="subtitle">Test Arabic PDF Generation</div>
        
        <div class="test-text">مرحباً بك في تطبيق إدارة المطاعم</div>
        <div class="test-text">Welcome to Restaurant Management App</div>
        
        <div class="test-text">طلبات اليوم: 15</div>
        <div class="test-text">Today's Orders: 15</div>
        
        <div class="test-text">المبلغ الإجمالي: 150.000 ر.ع.</div>
        <div class="test-text">Total Amount: OMR 150.000</div>
        
        <div class="test-text">نوع التوصيل: توصيل</div>
        <div class="test-text">Delivery Type: Delivery</div>
        
        <div class="test-text">الحالة: مكتمل</div>
        <div class="test-text">Status: Completed</div>
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
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    await browser.close();

    console.log('Test PDF generated successfully');

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=arabic-test.pdf'
      }
    });
  } catch (error) {
    console.error('Error generating test PDF:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate test PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
