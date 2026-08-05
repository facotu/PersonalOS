/**
 * UTF-8 CSV Formatter with BOM (\uFEFF) for Microsoft Excel compatibility
 */
export function formatAsCSV(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const escapeValue = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    // Escape double quotes by doubling them
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const headerLine = headers.map(escapeValue).join(",");
  const rowLines = rows.map((row) => row.map(escapeValue).join(","));

  // Prepend UTF-8 BOM (\uFEFF) so Excel opens Vietnamese characters correctly
  return "\uFEFF" + [headerLine, ...rowLines].join("\n");
}
