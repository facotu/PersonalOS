import { NextRequest, NextResponse } from "next/server";
import { ExportService } from "@/lib/export/service";
import { ExportResource, ExportFormat } from "@/lib/export/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const resource = searchParams.get("resource") as ExportResource;
    const format = searchParams.get("format") as ExportFormat;

    if (!resource || !format) {
      return NextResponse.json(
        { error: "Thiếu thông tin loại dữ liệu (resource) hoặc định dạng (format)." },
        { status: 400 }
      );
    }

    const filters = {
      projectId: searchParams.get("projectId") || undefined,
      status: searchParams.get("status") || undefined,
      priority: searchParams.get("priority") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      targetWeekIso: searchParams.get("targetWeekIso") || undefined,
    };

    const result = await ExportService.exportData(resource, format, filters);

    return new NextResponse(result.content, {
      status: 200,
      headers: {
        "Content-Type": result.mimeType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("Export API Error:", err);
    return NextResponse.json(
      { error: err.message || "Không thể xuất dữ liệu. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
