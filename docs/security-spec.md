# PERSONAL OS — SECURITY & PRIVACY SPECIFICATION

## 1. NGUYÊN TẮC BẢO MẬT CỐT LÕI

Personal OS quản lý toàn bộ công việc, dự án và thông tin cá nhân của người dùng. Do đó, hệ thống áp dụng tiêu chuẩn bảo mật nghiêm ngặt ở mọi tầng.

---

## 2. QUẢN LÝ BIẾN MÔI TRƯỜNG & SECRETS

1. **Không nạp Secrets vào Repository**: Tệp `.env.local` chứa API Keys tuyệt đối nằm trong `.gitignore`.
2. **Strict Zod Environment Schema**: Hệ thống khởi tạo kiểm tra biến môi trường lúc build/startup:

```typescript
import { z } from 'zod';

export const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  WEBHOOK_SECRET_KEY: z.string().min(32),
});

export const env = envSchema.parse(process.env);
```

---

## 3. BẢO MẬT CƠ SỞ DỮ LIỆU & RLS (ROW LEVEL SECURITY)

- **Độc lập dữ liệu (Multi-tenant Isolation)**: 100% bảng PostgreSQL bắt buộc kích hoạt RLS. Mỗi câu truy vấn từ Client đều được kiểm tra `auth.uid() = user_id`.
- **Service Role Key**: Chỉ được sử dụng trong các Route Handler bảo mật (chạy phía Server) hoặc Webhook đã xác thực, KHÔNG BAO GIỜ leak ra Client Bundle.

---

## 4. XÁC THỰC BẰNG PASSKEY / WEBAUTHN (FACE ID / TOUCH ID)

- Mã khóa riêng tư (Private Key) lưu an toàn trong chip bảo mật (Enclave) của thiết bị người dùng.
- Server chỉ lưu Public Key và Credential ID.
- Thách thức xác thực (Challenge) hết hạn sau 60 giây và chống tấn công Replay Attack.

---

## 5. CHỐNG TẤN CÔNG & GIỚI HẠN TỐC ĐỘ (RATE LIMITING)

- **Middleware Rate Limiting**: Áp dụng Rate Limit cho tất cả API Route Handlers:
  - API Thông thường: Tối đa 100 request / phút / user.
  - API AI Copilot: Tối đa 10 request / phút / user.
  - API Auth / Passkey: Tối đa 5 request / phút / IP.

---

## 6. LỊCH SỬ HOẠT ĐỘNG & AUDIT LOGS

Mọi hành động quan trọng (Xóa Project, Thay đổi mật khẩu, Đăng ký Passkey, Export dữ liệu) đều tự động ghi lại một bản ghi mã hóa trong bảng `activity_logs` với IP, User-Agent và Timestamp.
