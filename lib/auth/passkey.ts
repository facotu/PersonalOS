import { startAuthentication } from "@simplewebauthn/browser";

export function isPasskeySupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(
    window.PublicKeyCredential &&
    window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
  );
}

export async function loginWithPasskey(): Promise<{
  success: boolean;
  message: string;
  redirectTo?: string;
}> {
  if (!isPasskeySupported()) {
    return {
      success: false,
      message: "Trình duyệt hoặc thiết bị của bạn không hỗ trợ Passkey. Vui lòng sử dụng Email hoặc Google.",
    };
  }

  try {
    // 1. Fetch authentication options & single-use challenge from server
    const optionsRes = await fetch("/api/auth/passkey/login/options", {
      method: "POST",
    });

    const options = await optionsRes.json();

    if (!optionsRes.ok || !options || !options.challenge) {
      throw new Error(
        options?.error ||
        options?.message ||
        "Không tìm thấy thông tin tùy chọn Passkey. Vui lòng đảm bảo bạn đã đăng ký Passkey trong Cài đặt."
      );
    }

    // 2. Trigger browser platform authenticator via SimpleWebAuthn
    const asseResp = await startAuthentication({ optionsJSON: options });

    // 3. Verify assertion on server & establish Supabase session
    const verifyRes = await fetch("/api/auth/passkey/login/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(asseResp),
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.verified) {
      throw new Error(verifyData.message || "Xác thực Passkey thất bại.");
    }

    return {
      success: true,
      message: "Đăng nhập bằng Passkey thành công!",
      redirectTo: verifyData.redirectTo || "/dashboard",
    };
  } catch (err: any) {
    console.error("Passkey Login Error:", err);
    if (err.name === "NotAllowedError") {
      return {
        success: false,
        message: "Bạn đã hủy thao tác xác thực Passkey trên thiết bị.",
      };
    }
    if (err.message && err.message.includes("replace")) {
      return {
        success: false,
        message: "Chưa tìm thấy Passkey đã đăng ký cho tài khoản trên thiết bị này. Vui lòng đăng nhập bằng Email/Google và tạo Passkey trong mục Cài đặt.",
      };
    }
    return {
      success: false,
      message: err.message || "Xác thực Passkey bị hủy hoặc không hợp lệ.",
    };
  }
}
