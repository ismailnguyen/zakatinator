import { CalculationResult } from "@/types/zakat";

export function buildPrintableHtml(calc: CalculationResult) {
  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: calc.settings.baseCurrency }).format(n);
  const date = new Date(calc.timestamp).toLocaleString();
  const rowsByType = Object.entries(calc.breakdown.byType || {})
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(([k, v]) => `<tr><td>${k}</td><td style="text-align:right">${fmt(v as number)}</td></tr>`) 
    .join("");
  const rowsItems = (calc.breakdown.items || [])
    .map((it) => `
      <tr>
        <td>${escapeHtml(it.label)}</td>
        <td>${it.type}</td>
        <td style="text-align:right">${it.originalCurrency ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: it.originalCurrency }).format(it.originalValue) : '—'}</td>
        <td style="text-align:right">${fmt(it.convertedValue)}</td>
        <td>${it.included ? 'Included' : 'Excluded'}</td>
        <td>${it.reason ? escapeHtml(it.reason) : ''}</td>
      </tr>
    `)
    .join("");

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Zakatinator — Calculation</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif; margin: 24px; color: #111; }
        h1 { margin: 0 0 4px; font-size: 22px; }
        h2 { margin: 24px 0 8px; font-size: 16px; }
        p, td, th { font-size: 12px; }
        .meta { color: #555; margin-bottom: 16px; }
        .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin: 12px 0 16px; }
        .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; background: #fff; }
        .row { display: flex; justify-content: space-between; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th, td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        th { background: #f9fafb; font-weight: 600; }
        .right { text-align: right; }
        @media print { body { margin: 8mm; } .no-print { display: none; } }
      </style>
    </head>
    <body>
      <h1>Zakatinator — Calculation</h1>
      <div class="meta">Generated: ${escapeHtml(date)}</div>

      <div class="cards">
        <div class="card"><div class="row"><span>Gross Assets</span><strong>${fmt(calc.grossAssets)}</strong></div></div>
        <div class="card"><div class="row"><span>Deductions</span><strong>${fmt(calc.deductionsTotal)}</strong></div></div>
        <div class="card"><div class="row"><span>Net Assets</span><strong>${fmt(calc.netAssets)}</strong></div></div>
        <div class="card"><div class="row"><span>Zakat Due (2.5%)</span><strong>${fmt(calc.zakatDue)}</strong></div></div>
      </div>

      <h2>By Asset Type</h2>
      <table>
        <thead><tr><th>Type</th><th class="right">Amount</th></tr></thead>
        <tbody>${rowsByType || '<tr><td colspan="2">No included assets</td></tr>'}</tbody>
      </table>

      <h2>Itemized Breakdown</h2>
      <table>
        <thead><tr><th>Label</th><th>Type</th><th class="right">Original</th><th class="right">Converted</th><th>Included</th><th>Reason</th></tr></thead>
        <tbody>${rowsItems}</tbody>
      </table>

    </body>
  </html>`;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

