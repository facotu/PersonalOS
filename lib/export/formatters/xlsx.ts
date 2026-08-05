export interface SheetData {
  name: string;
  headers: string[];
  rows: (string | number | boolean | null | undefined)[][];
}

/**
 * Excel XML Spreadsheet Formatter with Vietnamese UTF-8, styled headers, and multiple sheet support
 */
export function formatAsXLSX(sheets: SheetData[]): string {
  const escapeXml = (str: any): string => {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Bottom"/>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#000000"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>
    <Style ss:ID="HeaderStyle">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0284C7"/>
      </Borders>
    </Style>
    <Style ss:ID="DataStyle">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#0F172A"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
    </Style>
  </Styles>`;

  const xmlSheets = sheets.map((sheet) => {
    const sheetName = escapeXml(sheet.name);

    const headerCells = sheet.headers
      .map((h) => `<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`)
      .join("");

    const dataRows = sheet.rows
      .map((row) => {
        const cells = row
          .map((cell) => {
            const isNum = typeof cell === "number";
            const cellType = isNum ? "Number" : "String";
            return `<Cell ss:StyleID="DataStyle"><Data ss:Type="${cellType}">${escapeXml(cell)}</Data></Cell>`;
          })
          .join("");
        return `<Row ss:Height="20">${cells}</Row>`;
      })
      .join("\n");

    return `
  <Worksheet ss:Name="${sheetName}">
    <Table ss:ExpandedColumnCount="${sheet.headers.length}" ss:ExpandedRowCount="${sheet.rows.length + 1}" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="20">
      <Row ss:Height="24">${headerCells}</Row>
      ${dataRows}
    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <FreezePanes/>
      <FrozenNoSplit/>
      <SplitHorizontal>1</SplitHorizontal>
      <TopRowBottomPane>1</TopRowBottomPane>
      <ActivePane>2</ActivePane>
    </WorksheetOptions>
  </Worksheet>`;
  });

  return `${xmlHeader}\n${xmlSheets.join("\n")}\n</Workbook>`;
}
