import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getAndConsumeChallenge } from "@/lib/auth/challenge";

export async function POST(request: Request) {
  try {
    const expectedChallenge = await getAndConsumeChallenge();
    if (!expectedChallenge) {
      return NextResponse.json(
        { verified: false, message: "Challenge hết hạn hoặc không hợp lệ. Vui lòng thử lại." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const credentialID = body.id;

    const supabase = createServerClient();

    // 1. Fetch passkey metadata & user profile from database
    const { data: passkey, error: dbError } = await supabase
      .from("user_passkeys")
      .select("*, profiles!inner(*)")
      .eq("credential_id", credentialID)
      .single();

    if (dbError || !passkey) {
      return NextResponse.json(
        { verified: false, message: "Không tìm thấy Passkey này trên hệ thống." },
        { status: 404 }
      );
    }

    const expectedRPID =
      process.env.WEBAUTHN_RP_ID ||
      (process.env.NODE_ENV === "production" ? "personal-os.vercel.app" : "localhost");

    const expectedOrigin =
      process.env.WEBAUTHN_ORIGIN ||
      (process.env.NODE_ENV === "production"
        ? "https://personal-os.vercel.app"
        : "http://localhost:3000");

    // Reconstruct Uint8Array public key buffer from Base64 string without data loss
    const publicKeyBuffer = Uint8Array.from(Buffer.from(passkey.public_key, "base64"));

    // 2. Verify Authentication Response using SimpleWebAuthn
    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin,
      expectedRPID,
      credential: {
        id: passkey.credential_id,
        publicKey: publicKeyBuffer,
        counter: passkey.counter || 0,
      },
    });

    if (verification.verified && verification.authenticationInfo) {
      // 3. COUNTER HANDLING AUDIT:
      // Update counter directly from verification.authenticationInfo.newCounter.
      // NEVER increment manually (counter + 1) to respect WebAuthn semantics & replay protection.
      const newCounter = verification.authenticationInfo.newCounter;

      await supabase
        .from("user_passkeys")
        .update({
          counter: newCounter,
          last_used_at: new Date().toISOString(),
        })
        .eq("id", passkey.id);

      // 4. PASSKEY LOGIN -> SUPABASE AUTH SESSION CREATION:
      // Generate a secure single-use auth link for passkey user email using Supabase Service Role (Server-side)
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (serviceRoleKey && supabaseUrl) {
        const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey);
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email: passkey.profiles.email,
        });

        if (!linkError && linkData?.properties?.action_link) {
          return NextResponse.json({
            verified: true,
            message: "Đăng nhập bằng Passkey thành công!",
            redirectTo: linkData.properties.action_link,
          });
        }
      }

      return NextResponse.json({
        verified: true,
        message: "Đăng nhập bằng Passkey thành công!",
        redirectTo: "/dashboard",
      });
    }

    return NextResponse.json(
      { verified: false, message: "Xác thực Passkey không thành công." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Passkey login verify error:", err);
    return NextResponse.json(
      { verified: false, message: err.message || "Lỗi xử lý xác thực từ Server." },
      { status: 500 }
    );
  }
}
