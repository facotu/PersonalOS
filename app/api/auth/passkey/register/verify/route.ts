import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { createClient } from "@/lib/supabase/server";
import { getAndConsumeChallenge } from "@/lib/auth/challenge";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Trust boundary: MUST be authenticated in current Supabase Session
    if (!user) {
      return NextResponse.json(
        { verified: false, message: "Vui lòng đăng nhập trước khi thêm Passkey." },
        { status: 401 }
      );
    }

    const expectedChallenge = await getAndConsumeChallenge();
    if (!expectedChallenge) {
      return NextResponse.json(
        { verified: false, message: "Challenge hết hạn hoặc không hợp lệ. Vui lòng thử lại." },
        { status: 400 }
      );
    }

    const { body, deviceName } = await request.json();

    const expectedRPID =
      process.env.WEBAUTHN_RP_ID ||
      (process.env.NODE_ENV === "production" ? "personal-os.vercel.app" : "localhost");

    const expectedOrigin =
      process.env.WEBAUTHN_ORIGIN ||
      (process.env.NODE_ENV === "production"
        ? "https://personal-os.vercel.app"
        : "http://localhost:3000");

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin,
      expectedRPID,
    });

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      const { credential } = registrationInfo;
      
      // PUBLIC KEY STORAGE TRANSFORM DOCUMENTATION:
      // SimpleWebAuthn credential.publicKey is a Uint8Array (binary key).
      // We convert Uint8Array -> Buffer -> Base64 string for safe text storage in PostgreSQL.
      // Reconstruction: Buffer.from(base64String, 'base64') recovers exact Uint8Array without loss.
      const publicKeyBase64 = Buffer.from(credential.publicKey).toString("base64");

      const { error: dbError } = await supabase.from("user_passkeys").insert({
        user_id: user.id, // Strictly bound to authenticated session user.id
        credential_id: credential.id,
        public_key: publicKeyBase64,
        counter: credential.counter,
        device_name: deviceName || "Platform Authenticator",
        backed_up: credential.backedUp,
        transports: credential.transports || ["internal"],
      });

      if (dbError) {
        console.error("Passkey DB Save Error:", dbError);
        return NextResponse.json(
          { verified: false, message: "Lỗi lưu thông tin Passkey vào cơ sở dữ liệu." },
          { status: 500 }
        );
      }

      return NextResponse.json({ verified: true, message: "Thêm Passkey thành công!" });
    }

    return NextResponse.json(
      { verified: false, message: "Xác thực phản hồi từ thiết bị không hợp lệ." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Passkey register verify error:", err);
    return NextResponse.json(
      { verified: false, message: err.message || "Lỗi xử lý xác thực từ Server." },
      { status: 500 }
    );
  }
}
