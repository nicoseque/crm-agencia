const puppeteer = require('puppeteer');

async function generateQuotePdf(quote) {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    // ===== Helpers =====
    const safe = (v, f = '-') =>
      v === undefined || v === null || v === '' ? f : v;

    const formatMoney = (value, currency = 'ARS') =>
      new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0
      }).format(Number(value || 0));

    // ===== LOGO BASE64 =====
    const LOGO_BASE64 = `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`;

    const html = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            padding: 48px;
            color: #1c1c1c;
            font-size: 13px;
          }

          .header {
            display: grid;
            grid-template-columns: auto 1fr auto;
            align-items: center;
            border-bottom: 2px solid #e5e5e5;
            padding-bottom: 16px;
            margin-bottom: 32px;
          }

          .header img {
            height: 48px;
          }

          .title {
            text-align: center;
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 1px;
          }

          .meta {
            text-align: right;
            font-size: 12px;
            color: #555;
          }

          .section {
            margin-bottom: 26px;
          }

          .section h3 {
            font-size: 14px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 4px;
            margin-bottom: 10px;
          }

          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
          }

          .label {
            font-weight: bold;
            color: #555;
          }

          .total {
            margin-top: 40px;
            padding: 22px;
            border: 2px solid #000;
            text-align: center;
            font-size: 22px;
            font-weight: bold;
          }

          .footer {
            margin-top: 50px;
            font-size: 11px;
            text-align: center;
            color: #777;
          }
        </style>
      </head>

      <body>
        <div class="header">
          <img src="data:image/png;base64,${LOGO_BASE64}" />
          <div class="title">PRESUPUESTO COMERCIAL</div>
          <div class="meta">
            Nº ${quote.id}<br/>
            Fecha: ${new Date(quote.created_at).toLocaleDateString()}
          </div>
        </div>

        <div class="section">
          <h3>Datos del cliente</h3>
          <div class="row"><span class="label">Cliente</span><span>${safe(
            quote.client_first_name
          )} ${safe(quote.client_last_name)}</span></div>
          <div class="row"><span class="label">DNI</span><span>${safe(
            quote.client_dni
          )}</span></div>
        </div>

        <div class="section">
          <h3>Producto</h3>
          <div class="row"><span class="label">Producto</span><span>${safe(
            quote.product
          )}</span></div>
          <div class="row"><span class="label">Descripción</span><span>${safe(
            quote.description
          )}</span></div>
        </div>

        <div class="section">
          <h3>Estado</h3>
          <div class="row"><span class="label">Estado actual</span><span>${safe(
            quote.status
          )}</span></div>
        </div>

        <div class="total">
          TOTAL ${formatMoney(quote.total_amount, quote.currency)}
        </div>

        <div class="footer">
          Presupuesto generado automáticamente por el sistema.<br/>
          Documento sin validez fiscal.
        </div>
      </body>
    </html>
    `;

    await page.setContent(html, { waitUntil: 'load' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    return Buffer.from(pdf);
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { generateQuotePdf };
