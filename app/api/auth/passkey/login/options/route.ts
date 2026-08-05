import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { createAndStoreChallenge } from "@/lib/auth/challenge";

export async function POST() {
  try {
    const challenge = await createAndStoreChallenge();

    const rpID =
      process.env.WEBAUTHN_RP_ID ||
      (process.env.NODE_ENV === "production" ? "personal-os.vercel.app" : "localhost");

    const options = await generateAuthenticationOptions({
      rpID,
      challenge,
      userVerification: "preferred",
    });

    return NextResponse.json(options);
  } catch (err: any) {
    console.error("Passkey login options error:", err);
    return NextResponse.json(
      { error: "Không thể khởi tạo tùy chọn đăng nhập bằng Passkey." },
      { status: 500 }
    );
  }
}
