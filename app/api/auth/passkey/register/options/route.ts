import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { createClient } from "@/lib/supabase/server";
import { createAndStoreChallenge } from "@/lib/auth/challenge";

export async function POST() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Trust boundary: MUST be authenticated in current Supabase Session
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập trước khi thêm Passkey." },
        { status: 401 }
      );
    }

    // Get existing passkeys for this user to avoid duplicate registration
    const { data: existingPasskeys } = await supabase
      .from("user_passkeys")
      .select("credential_id")
      .eq("user_id", user.id);

    const excludeCredentials = (existingPasskeys || []).map((pk) => ({
      id: pk.credential_id,
      transports: ["internal" as const, "hybrid" as const],
    }));

    const challenge = await createAndStoreChallenge();

    const rpID =
      process.env.WEBAUTHN_RP_ID ||
      (process.env.NODE_ENV === "production" ? "personal-os.vercel.app" : "localhost");

    const options = await generateRegistrationOptions({
      rpName: "Personal OS",
      rpID,
      userID: new TextEncoder().encode(user.id),
      userName: user.email || "user@personalos.app",
      userDisplayName: user.user_metadata?.full_name || user.email || "User",
      challenge,
      attestationType: "none",
      excludeCredentials,
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        authenticatorAttachment: "platform",
      },
    });

    return NextResponse.json(options);
  } catch (err: any) {
    console.error("Passkey register options error:", err);
    return NextResponse.json(
      { error: "Không thể tạo tùy chọn đăng ký Passkey." },
      { status: 500 }
    );
  }
}
