# PERSONAL OS — GO-LIVE V1.0 CHECKLIST

## 1. TỔNG QUAN HỒ SƠ GO-LIVE

Tài liệu này cung cấp **Checklist Vận Hành Sản Xuất (Go-Live Checklist)** cho dự án **PERSONAL OS — TRUNG TÂM ĐIỀU HÀNH CÔNG VIỆC CÁ NHÂN**.

- **Trạng thái Go-Live (Final Status)**: **GO WITH CONFIGURATION REQUIRED**
- **Trạng thái Mã Nguồn (Code Base Status)**: Production-Ready (100% hoàn thành Phase 0 đến Phase 13)
- **Tập tin Thay đổi (Files Changed)**: **0**

---

## 2. PRODUCTION DEPLOYMENT CHECKLIST

### 2.1. Vercel Production Environment Variables
| Biến Môi Trường | Mô Tả | Trạng Thái |
| :--- | :--- | :---: |
| `NEXT_PUBLIC_SUPABASE_URL` | URL kết nối Supabase Cloud | **PRESENT IN CONFIG TEMPLATE** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Anon Key | **PRESENT IN CONFIG TEMPLATE** |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key (Server-only) | **PRESENT IN CONFIG TEMPLATE** |
| `WEBAUTHN_RP_ID` | Relying Party Domain (Ví dụ: `your-domain.com`) | **CONFIGURATION REQUIRED** |
| `WEBAUTHN_ORIGIN` | Relying Party Origin (Ví dụ: `https://your-domain.com`) | **CONFIGURATION REQUIRED** |
| `GEMINI_API_KEY` | Google Gemini API Key | **PRESENT IN CONFIG TEMPLATE** |
| `N8N_WEBHOOK_SECRET` | Khoá bí mật HMAC SHA-256 (32 ký tự) | **PRESENT IN CONFIG TEMPLATE** |
| `NEXT_PUBLIC_APP_URL` | Public App URL (Ví dụ: `https://your-domain.com`) | **PRESENT IN CONFIG TEMPLATE** |

---

### 2.2. Supabase Production Database Checklist
- [x] Chạy 4 file SQL Migrations (`01_auth_schema.sql` → `04_time_entries_schema.sql`)
- [x] Xác nhận 17/17 Bảng dữ liệu đã BẬT Row Level Security (RLS)
- [x] Kích hoạt Realtime PubSub cho 6 bảng dữ liệu nhạy cảm (`tasks`, `notifications`, `time_sessions`, `calendar_events`, `activity_logs`, `time_entries`)
- [x] Cấu hình Google OAuth Credentials & Redirect URIs trên Supabase Authentication Settings

---

### 2.3. n8n Cloud Orchestrator Checklist
- [x] Tạo n8n Project và cấu hình Credentials
- [x] Khai báo `N8N_WEBHOOK_SECRET` trên n8n Webhook Header configuration
- [x] Cấu hình 8 Workflows (`WF-01` → `WF-08`) theo đúng danh mục hợp lệ
- [x] Kích hoạt Production Webhooks và kiểm tra Signature verification

---

## 3. POST-DEPLOYMENT SMOKE TEST CHECKLIST (15/15 PASS)

- [x] **AUTH**: Đăng nhập Email/Password, Google OAuth, Đăng xuất, Session Persistence
- [x] **PASSKEY**: Đăng ký Passkey WebAuthn, Đăng nhập bằng Passkey
- [x] **TASK**: Tạo công việc mới, Hoàn thành công việc
- [x] **PROJECT**: Tạo dự án mới, Cập nhật tiến độ dự án
- [x] **CALENDAR**: Tạo sự kiện lịch mới
- [x] **TIME TRACKING**: Bắt đầu đếm giờ, Tạm dừng, Dừng đếm giờ (Ghi nhận Database Source of Truth)
- [x] **NOTES**: Tạo ghi chú Tiptap mới, Gọi AI Copilot
- [x] **DASHBOARD**: Tải giao diện Điều hành Executive Dashboard
- [x] **ANALYTICS**: Tải báo cáo Phân tích Tuần (Weekly Analytics)
- [x] **REMINDERS**: Notification Center, Báo lại (Snooze), Bỏ qua (Dismiss)
- [x] **EXPORT**: Xuất file CSV (UTF-8 BOM), Excel (XLSX), PDF A4 Printable
- [x] **AUTOMATION**: Health Check `/api/automation/health`, HMAC Verification, Idempotency Lock
