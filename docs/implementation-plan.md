# PERSONAL OS — IMPLEMENTATION PLAN (PHASE 0 TO PHASE 16)

## TỔNG QUAN LỘ TRÌNH THỰC THI (ROADMAP OVERVIEW)

Dự án **PERSONAL OS** được phân chia thành **17 Phase chi tiết** từ Phase 0 đến Phase 16. Mỗi Phase có mục tiêu độc lập, tiêu chuẩn nghiệm thu rõ ràng và kế hoạch xác minh cụ thể.

---

### PHASE 0 — DISCOVERY & DOCUMENTATION (HOÀN THÀNH)
- **Objective**: Phân tích toàn bộ yêu cầu, thiết kế hệ thống, cơ sở dữ liệu, API, giao diện UI/UX và quy chuẩn bảo mật.
- **Files**: `/docs/*.md`, `/AGENTS.md`.
- **Database changes**: Không.
- **UI changes**: Thiết kế wireframes & design tokens.
- **API changes**: Xây dựng API Specification.
- **Tests**: Rà soát tiêu chuẩn thiết kế.
- **Acceptance criteria**: Đầy đủ 9 tệp tài liệu trong `/docs/` và `/AGENTS.md`.
- **Verification steps**: Kiểm tra danh sách tài liệu và đối chiếu yêu cầu ban đầu.

---

### PHASE 1 — FOUNDATION (KHỞI TẠO DỰ ÁN & DESIGN SYSTEM)
- **Objective**: Khởi tạo Next.js 14+ (App Router, TypeScript), Tailwind CSS, shadcn/ui, Radix UI và cấu hình Dark Mode mặc định.
- **Files**: `package.json`, `tailwind.config.ts`, `app/globals.css`, `lib/utils.ts`, `components/ui/*`.
- **Database changes**: Không.
- **UI changes**: Thiết lập Design tokens (Color HSL, Typography Inter/Outfit, Dark mode layout shell).
- **API changes**: Không.
- **Tests**: Build test `npm run build`.
- **Acceptance criteria**: Khởi tạo dự án chạy mượt ở `localhost:3000`, UI hiển thị Dark Mode tinh tế.
- **Verification steps**: Truy cập trình duyệt kiểm tra giao diện cơ sở và component shadcn/ui.

---

### PHASE 2 — AUTHENTICATION & PASSKEY
- **Objective**: Tích hợp Supabase Auth (Email/Pass, Google OAuth) và Passkey / WebAuthn (Touch ID / Face ID).
- **Files**: `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `app/api/auth/passkey/*`.
- **Database changes**: Tạo bảng `profiles`, `user_passkeys`.
- **UI changes**: Trạng thái Đăng nhập, Đăng ký, Đăng nhập bằng Passkey (Biometric Button).
- **API changes**: Route Handlers xử lý WebAuthn challenge và session verification.
- **Tests**: Auth flow test & Passkey mock test.
- **Acceptance criteria**: Người dùng đăng nhập thành công và duy trì Session an toàn.
- **Verification steps**: Thử nghiệm đăng nhập Email và quét Vân tay/Khuôn mặt qua Passkey.

---

### PHASE 3 — DATABASE & RLS ENFORCEMENT
- **Objective**: Tạo đầy đủ 13 bảng PostgreSQL trên Supabase, kích hoạt RLS 100% và tạo các Index tối ưu.
- **Files**: `supabase/migrations/*.sql`, `lib/types/database.types.ts`.
- **Database changes**: Apply full schema (tasks, projects, notes, time_sessions, etc.).
- **UI changes**: Không.
- **API changes**: Supabase client wrapper type-safe.
- **Tests**: `npx supabase test db` kiểm tra chính sách RLS.
- **Acceptance criteria**: Mỗi user chỉ truy vấn được đúng dữ liệu thuộc `user_id` của mình.
- **Verification steps**: Kiểm tra kết nối Supabase và test RLS qua 2 account khác nhau.

---

### PHASE 4 — TASK MANAGEMENT MODULE
- **Objective**: Xây dựng module Quản lý công việc với đầy đủ views (Hôm nay, Tuần này, Quá hạn, Tất cả, Kanban, Calendar).
- **Files**: `app/(dashboard)/tasks/page.tsx`, `components/tasks/*`.
- **Database changes**: Bảng `tasks`, `tags`, `task_tags`.
- **UI changes**: Giao diện Kanban kẹp drag-and-drop, Task list, Filter bar, Modal tạo/sửa task.
- **API changes**: Server Actions CRUD Task.
- **Tests**: Task CRUD unit tests & Kanban drag test.
- **Acceptance criteria**: Tạo, sửa, xóa, chuyển trạng thái task mượt mà không delay.
- **Verification steps**: Tạo 5 task với các mức Priority khác nhau và thử nghiệm kéo thả trên Kanban.

---

### PHASE 5 — PROJECTS MODULE
- **Objective**: Quản lý dự án, tiến độ tự động %, mục tiêu và Timeline/Gantt chart.
- **Files**: `app/(dashboard)/projects/page.tsx`, `components/projects/*`.
- **Database changes**: Bảng `projects`.
- **UI changes**: Project cards, Project detail layout, Progress bars, Timeline view.
- **API changes**: Server Actions CRUD Project & Auto-progress calculation.
- **Tests**: Project progress math logic test.
- **Acceptance criteria**: Progress % của Project tự động cập nhật khi các Task con hoàn thành.
- **Verification steps**: Tạo dự án, gán task và hoàn thành task để xem % thay đổi.

---

### PHASE 6 — CALENDAR MODULE
- **Objective**: Màn hình Lịch tích hợp Day / Week / Month hiển thị Task deadlines và Events.
- **Files**: `app/(dashboard)/calendar/page.tsx`, `components/calendar/*`.
- **Database changes**: Bảng `calendar_events`.
- **UI changes**: Lịch lưới trực quan, phân biệt màu giữa Deadline, Event, Meeting.
- **API changes**: Server Actions CRUD Events & Fetch Calendar Grid Data.
- **Tests**: Calendar grid render test.
- **Acceptance criteria**: Hiển thị chính xác deadline công việc và các buổi họp theo mốc giờ.
- **Verification steps**: Chuyển đổi giữa chế độ Ngày, Tuần, Tháng.

---

### PHASE 7 — NOTES & AI COPILOT MODULE
- **Objective**: Xây dựng Rich-text Editor và tích hợp AI Copilot (Gemini API Abstraction Layer).
- **Files**: `app/(dashboard)/notes/page.tsx`, `components/notes/*`, `lib/ai/*`, `app/api/ai/analyze-note/route.ts`.
- **Database changes**: Bảng `notes`, `attachments`.
- **UI changes**: Tiptap Editor, AI Copilot Drawer, Action items extractor.
- **API changes**: Route Handler gọi Gemini API tóm tắt và trích xuất Action Items.
- **Tests**: AI Abstraction Layer mock response test.
- **Acceptance criteria**: Bấm nút "AI Copilot" trả về Tóm tắt & Action Items dưới 3s.
- **Verification steps**: Nhập nội dung họp, bấm AI Copilot và duyệt tạo Task tự động.

---

### PHASE 8 — TIME TRACKING MODULE
- **Objective**: Bộ đếm thời gian trực tiếp (Live Timer) và nhật ký làm việc (Time Sessions Log).
- **Files**: `app/(dashboard)/time-tracking/page.tsx`, `components/timer/*`, `lib/stores/useTimerStore.ts`.
- **Database changes**: Bảng `time_sessions`.
- **UI changes**: Đồng hồ bấm giờ live (Stopwatch), Nút START/STOP, Form đánh giá Focus score (1-10).
- **API changes**: Server Actions Start/Stop Timer.
- **Tests**: Timer persistent state test.
- **Acceptance criteria**: Timer tiếp tục chạy đúng khi reload trang, tự động cộng dồn `actual_hours`.
- **Verification steps**: Bấm START, đợi 1 phút, bấm STOP và kiểm tra giờ cộng dồn vào Task.

---

### PHASE 9 — DASHBOARD TRUNG TÂM DIEU HANH
- **Objective**: Lắp ráp màn hình Dashboard với đầy đủ 10 widget thông tin.
- **Files**: `app/(dashboard)/dashboard/page.tsx`, `components/dashboard/*`.
- **Database changes**: Không (sử dụng tổng hợp từ các bảng).
- **UI changes**: Widget grid, Top 3 Priorities, Today's Schedule, Quick Actions Command Palette.
- **API changes**: Aggregate Dashboard Data API / Server Action.
- **Tests**: Dashboard load performance test (< 500ms).
- **Acceptance criteria**: Hiển thị đầy đủ Lời chào, Task hôm nay, Overdue task, Lịch hôm nay và Quick Actions.
- **Verification steps**: Kiểm tra tính chính xác của dữ liệu trên Dashboard so với các module chi tiết.

---

### PHASE 10 — WEEKLY ANALYTICS MODULE
- **Objective**: Dashboard phân tích hiệu suất làm việc 7 ngày với Recharts.
- **Files**: `app/(dashboard)/analytics/page.tsx`, `components/analytics/*`.
- **Database changes**: Không.
- **UI changes**: 5 biểu đồ Recharts (Task completion by day, Focus hours, Allocation, Estimated vs Actual).
- **API changes**: Fetch Analytics Statistics API.
- **Tests**: Analytics calculation logic test.
- **Acceptance criteria**: Biểu đồ hiển thị nét, đẹp, chính xác số liệu làm việc thực tế.
- **Verification steps**: Tạo một số dữ liệu test và kiểm tra sự thay đổi của biểu đồ.

---

### PHASE 11 — SMART REMINDERS & NOTIFICATIONS
- **Objective**: Trung tâm thông báo và cảnh báo deadline 24h, 1h, Overdue.
- **Files**: `components/notifications/*`, `app/api/notifications/*`.
- **Database changes**: Bảng `notifications`.
- **UI changes**: Notification Center popover, In-app badges.
- **API changes**: Fetch & Mark as read Notifications API.
- **Tests**: Notification trigger test.
- **Acceptance criteria**: Thông báo xuất hiện đúng lúc khi có Task trễ hạn hoặc tới giờ nhắc.
- **Verification steps**: Kiểm tra trung tâm thông báo khi tạo task trễ deadline.

---

### PHASE 12 — EXPORT SERVICE (PDF / XLSX / CSV)
- **Objective**: Tự động tạo và tải về báo cáo PDF, Excel XLSX và CSV.
- **Files**: `app/api/export/pdf/route.ts`, `app/api/export/xlsx/route.ts`, `lib/export/*`.
- **Database changes**: Không.
- **UI changes**: Export Buttons trên Task List, Analytics và Review pages.
- **API changes**: Route Handlers sinh file PDF nét chuẩn in ấn và XLSX chuẩn định dạng.
- **Tests**: PDF generation stream test.
- **Acceptance criteria**: File PDF chứa biểu đồ nét căng; file Excel không bị lỗi font Tiếng Việt.
- **Verification steps**: Tải về file PDF và Excel, mở xem giao diện và định dạng.

---

### PHASE 13 — AUTOMATION INTEGRATION (n8n WEBHOOKS)
- **Objective**: Tích hợp n8n Webhook cho Daily Brief sáng và Auto Weekly Review.
- **Files**: `app/api/v1/webhooks/n8n/*`, `lib/security/webhook.ts`.
- **Database changes**: Bảng `weekly_reviews`.
- **UI changes**: Màn hình xem Báo cáo tuần (Weekly Review Viewer).
- **API changes**: HMAC Signed Webhook Handlers.
- **Tests**: HMAC signature verification test.
- **Acceptance criteria**: n8n gọi Webhook thành công với HMAC signature hợp lệ.
- **Verification steps**: Mô phỏng n8n curl request gửi webhook và kiểm tra bản ghi Review tự động sinh.

---

### PHASE 14 — SECURITY HARDENING & RATE LIMITING
- **Objective**: Gia cố bảo mật toàn bộ hệ thống, thêm Middleware Rate Limiting và Audit Logging.
- **Files**: `middleware.ts`, `lib/security/ratelimit.ts`.
- **Database changes**: Bảng `activity_logs`.
- **UI changes**: Không.
- **API changes**: Enforce Rate Limit trên API Routes.
- **Tests**: Penetration test & Rate limit breach test.
- **Acceptance criteria**: Từ chối request vượt quá tần suất và ghi log 100% hành động nhạy cảm.
- **Verification steps**: Thử nghiệm spam request để xác minh HTTP 429.

---

### PHASE 15 — COMPREHENSIVE TESTING & BUG FIXING
- **Objective**: Chạy toàn bộ quy trình E2E Playwright tests, kiểm thử đa trình duyệt và tối ưu hiệu năng.
- **Files**: `tests/e2e/*.spec.ts`, `tests/unit/*.test.ts`.
- **Database changes**: Không.
- **UI changes**: Sửa lỗi hiển thị mượt mà trên Mobile & Desktop.
- **API changes**: Khắc phục các bottleneck truy vấn.
- **Tests**: Playwright test suite Pass 100%.
- **Acceptance criteria**: Không có console error, đạt mốc Lighthouse > 90 điểm.
- **Verification steps**: Chuyển các kịch bản test chính qua Playwright runner.

---

### PHASE 16 — DEPLOYMENT & PRODUCTION LAUNCH
- **Objective**: Triển khai chính thức dứng dụng lên Vercel, kết nối Supabase Production DB và n8n Engine.
- **Files**: `.env.production`, `vercel.json`, `README.md`.
- **Database changes**: Production Migration run.
- **UI changes**: Production URL readiness.
- **API changes**: Production Webhook URLs.
- **Tests**: Live Smoke Test on Production Domain.
- **Acceptance criteria**: Ứng dụng hoạt động 24/7 ổn định trên HTTPS Vercel Domain.
- **Verification steps**: Đăng nhập và thực hiện 1 luồng công việc hoàn chỉnh từ A-Z trên môi trường Production.
