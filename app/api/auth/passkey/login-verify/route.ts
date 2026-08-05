import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, message: "Thiếu Credential ID xác thực." },
        { status: 400 }
      );
    }

    // In Production with Supabase WebAuthn / user_passkeys table, verify signature & counter.
    return NextResponse.json({
      success: true,
      message: "Xác thực Passkey thành công.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi xác thực Server." },
      { status: 500 }
    );
  }
}
