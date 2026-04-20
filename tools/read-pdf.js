const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const pdfPath = path.join(__dirname, '..', 'Guidelines.pdf');
const outPath = path.join(__dirname, '..', 'Guidelines-text.txt');

const pdfParser = new PDFParser();

pdfParser.on('pdfParser_dataError', errData => {
  console.error('Parse error:', errData.parserError);
});

pdfParser.on('pdfParser_dataReady', pdfData => {
  // Extract text from all pages
  let fullText = '';
  if (pdfData.Pages) {
    pdfData.Pages.forEach((page, pi) => {
      fullText += `\n=== PAGE ${pi + 1} ===\n`;
      if (page.Texts) {
        page.Texts.forEach(textItem => {
          if (textItem.R) {
            textItem.R.forEach(run => {
              const decoded = decodeURIComponent(run.T);
              fullText += decoded + ' ';
            });
          }
        });
        fullText += '\n';
      }
    });
  }
  fs.writeFileSync(outPath, fullText, 'utf8');
  console.log('Pages:', pdfData.Pages ? pdfData.Pages.length : 0);
  console.log('Text length:', fullText.length);
  console.log('Saved to:', outPath);
  console.log('\n--- FULL CONTENT ---\n');
  console.log(fullText);
});

pdfParser.loadPDF(pdfPath);
