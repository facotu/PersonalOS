export interface PDFSection {
  title?: string;
  headers?: string[];
  rows?: (string | number | boolean | null | undefined)[][];
  summaryBoxes?: { label: string; value: string | number }[];
}

/**
 * Printable HTML PDF Formatter with 100% Vietnamese Unicode support and clean typography
 */
export function formatAsPDF(
  documentTitle: string,
  metaInfo: { label: string; value: string }[],
  sections: PDFSection[]
): string {
  const metaHtml = metaInfo
    .map((m) => `<div><strong>${m.label}:</strong> ${m.value}</div>`)
    .join("");

  const sectionsHtml = sections
    .map((sec) => {
      let boxesHtml = "";
      if (sec.summaryBoxes && sec.summaryBoxes.length > 0) {
        boxesHtml = `
          <div class="kpi-grid">
            ${sec.summaryBoxes
              .map(
                (b) => `
              <div class="kpi-box">
                <div class="kpi-label">${b.label}</div>
                <div class="kpi-value">${b.value}</div>
              </div>`
              )
              .join("")}
          </div>`;
      }

      let tableHtml = "";
      if (sec.headers && sec.rows) {
        const thHtml = sec.headers.map((h) => `<th>${h}</th>`).join("");
        const trHtml = sec.rows
          .map(
            (r) =>
              `<tr>${r.map((c) => `<td>${c === null || c === undefined ? "" : c}</td>`).join("")}</tr>`
          )
          .join("");

        tableHtml = `
          <table>
            <thead><tr>${thHtml}</tr></thead>
            <tbody>${trHtml}</tbody>
          </table>`;
      }

      return `
        <div class="section">
          ${sec.title ? `<h2>${sec.title}</h2>` : ""}
          ${boxesHtml}
          ${tableHtml}
        </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${documentTitle}</title>
  <style>
    @media print {
      @page { margin: 15mm; size: A4; }
      body { -webkit-print-color-adjust: exact; }
    }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
      font-size: 13px;
    }
    .header {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0 0 6px 0;
      color: #0284c7;
      font-size: 22px;
      font-weight: 700;
    }
    .meta {
      display: flex;
      gap: 20px;
      font-size: 11px;
      color: #64748b;
    }
    .section {
      margin-bottom: 24px;
    }
    .section h2 {
      font-size: 15px;
      color: #1e293b;
      margin: 0 0 10px 0;
      border-left: 4px solid #0284c7;
      padding-left: 8px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 10px;
      margin-bottom: 14px;
    }
    .kpi-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
      text-align: center;
    }
    .kpi-label { font-size: 11px; color: #64748b; }
    .kpi-value { font-size: 16px; font-weight: 700; color: #0284c7; margin-top: 2px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 12px;
    }
    th {
      background: #1e293b;
      color: #ffffff;
      font-weight: 600;
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #334155;
    }
    td {
      padding: 7px 10px;
      border: 1px solid #e2e8f0;
    }
    tr:nth-child(even) { background: #f8fafc; }
    .footer {
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${documentTitle}</h1>
    <div class="meta">${metaHtml}</div>
  </div>
  ${sectionsHtml}
  <div class="footer">
    Báo cáo được xuất tự động từ hệ thống Personal OS — ${new Date().toLocaleDateString("vi-VN")}
  </div>
  <script>
    // Auto trigger print dialog on window load if opened as standalone print view
    window.onload = function() {
      if (window.location.search.includes("print=true")) {
        window.print();
      }
    };
  </script>
</body>
</html>`;
}
