import PdfPrinter from 'pdfmake';

const fonts = {
  Cairo: {
    normal: 'public/fonts/Cairo-Regular.ttf',
    bold: 'public/fonts/Cairo-Bold.ttf'
  }
};

const printer = new PdfPrinter(fonts);

export async function generateArabicPDF(data: { title: string }) {
  const docDefinition = {
    content: [
      { text: 'English: ' + data.title, fontSize: 16 },
      {
        text: 'Arabic: مرحباً بك في موقعنا',
        font: 'Cairo',
        alignment: 'right',
        fontSize: 16
      }
    ]
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const chunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    pdfDoc.on('data', (chunk) => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', (err) => reject(err));
    pdfDoc.end();
  });
}
