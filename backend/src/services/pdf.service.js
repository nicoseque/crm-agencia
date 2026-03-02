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

    /* ================= HELPERS ================= */

    const safe = (v, f = '-') =>
      v === undefined || v === null || v === '' ? f : v;

    const formatMoney = (value, currency) =>
      new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: currency || 'ARS',
        minimumFractionDigits: 0
      }).format(Number(value || 0));

    /* ================= HTML ================= */

    const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial; padding: 48px; font-size: 13px; }
          .header { display:grid; grid-template-columns:auto 1fr auto; border-bottom:2px solid #e5e5e5; padding-bottom:16px; margin-bottom:32px }
          .title { text-align:center; font-size:22px; font-weight:bold }
          .meta { text-align:right; font-size:12px; color:#555 }
          .section { margin-bottom:26px }
          .section h3 { font-size:14px; border-bottom:1px solid #ccc; margin-bottom:10px }
          .row { display:flex; justify-content:space-between; margin-bottom:6px }
          .label { font-weight:bold; color:#555 }
          .total { margin-top:32px; padding:20px; border:2px solid #000; text-align:center; font-size:22px; font-weight:bold }
          .box { border:1px dashed #999; padding:12px; background:#fafafa }
          .used-note { margin-top:10px; font-size:11px; color:#555; font-style:italic }
        </style>
      </head>

      <body>
        <div class="header">
          <div></div>
          <div class="title">PRESUPUESTO COMERCIAL</div>
          <div class="meta">Nº ${quote.id}<br/>Fecha: ${new Date(quote.created_at).toLocaleDateString()}</div>
        </div>

        <div class="section">
          <h3>Cliente</h3>
          <div class="row"><span class="label">Nombre</span><span>${safe(quote.client_first_name)} ${safe(quote.client_last_name)}</span></div>
          <div class="row"><span class="label">DNI</span><span>${safe(quote.client_dni)}</span></div>
        </div>

        <div class="section">
          <h3>Producto</h3>
          <div class="row"><span class="label">Producto</span><span>${safe(quote.product)}</span></div>
          <div class="row"><span class="label">Valor</span><span>${formatMoney(quote.total_amount, quote.currency)}</span></div>
        </div>

        <div class="section">
          <h3>Condiciones del plan</h3>
          <div class="row"><span class="label">Cuotas</span><span>Hasta ${safe(quote.installments_qty)} cuotas</span></div>
          <div class="row"><span class="label">Cuota pura</span><span>${formatMoney(quote.installment_pure, quote.currency)}</span></div>
          <div class="row"><span class="label">Cuota final</span><span>${formatMoney(quote.installment_final, quote.currency)}</span></div>
          <div class="row"><span class="label">Retiro</span><span>A partir de cuota ${safe(quote.retiro_from_installment)}</span></div>
          <div class="row"><span class="label">Mecanismos</span><span>${safe(quote.mechanisms)}</span></div>
          <div class="row"><span class="label">Gastos de retiro</span><span>${safe(quote.retiro_costs)}%</span></div>
          <div class="row"><span class="label">Adjudicación</span><span>${safe(quote.adjudication_programmed)}</span></div>
        </div>

        <div class="section">
          <h3>Beneficios para ${safe(quote.client_first_name)}</h3>
          <div class="box">${safe(quote.benefits, '—')}</div>
        </div>

        ${quote.has_used_vehicle ? `
          <div class="section">
            <h3>Vehículo entregado en parte de pago</h3>
            <div class="row"><span class="label">Marca</span><span>${safe(quote.vehicle_brand)}</span></div>
            <div class="row"><span class="label">Modelo</span><span>${safe(quote.vehicle_model)}</span></div>
            <div class="row"><span class="label">Versión</span><span>${safe(quote.vehicle_version)}</span></div>
            <div class="row"><span class="label">Año</span><span>${safe(quote.vehicle_year)}</span></div>
            <div class="row"><span class="label">Valor estimado</span><span>${formatMoney(quote.vehicle_price, quote.currency)}</span></div>
            <div class="used-note">
              El valor de toma del vehículo se confirmará en la tasación final en el concesionario oficial.
            </div>
          </div>
        ` : ''}

        <div class="total">
          TOTAL ${formatMoney(quote.total_amount, quote.currency)}
        </div>
      </body>
    </html>
    `;

    await page.setContent(html, { waitUntil: 'load' });

    const pdf = await page.pdf({ format: 'A4', printBackground: true });

    return Buffer.from(pdf);
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { generateQuotePdf };