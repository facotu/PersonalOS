# PERSONAL OS — TRUNG TÂM ĐIỀU HÀNH CÔNG VIỆC CÁ NHÂN (EXECUTIVE WORK CENTER)

![Personal OS Banner](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-emerald?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)

> **PERSONAL OS** là hệ thống trung tâm điều hành công việc cá nhân hóa chuẩn Executive. Giúp bạn quản lý toàn bộ công việc, dự án, lịch trình, thời gian làm việc, ghi chú AI và tự động hóa quy trình trên một giao diện hiện đại, tối giản, cực kỳ mượt mà và bảo mật cao.

---

## 🌟 TÍNH NĂNG NỔI BẬT (KEY FEATURES)

### 🛡️ 1. Xác thực Bảo mật Sinh trắc học (Passkey & WebAuthn)
- **Đăng nhập 1-chạm**: Đăng nhập mượt mà bằng Vân tay, TouchID, FaceID hoặc Windows Hello không cần mật khẩu.
- **Dự phòng linh hoạt**: Hỗ trợ xác thực qua Email / Mật khẩu và Google OAuth 2.0.

### 🎯 2. Trung tâm Điều hành (Executive Dashboard)
- Lời chào cá nhân hóa theo thời gian thực (Sáng / Chiều / Tối).
- Thống kê công việc ưu tiên (P0/P1), công việc hôm nay và cảnh báo công việc quá hạn.
- Timeline lịch xem nhanh 7 ngày tới và tiến độ tổng quan các dự án đang chạy.
- Thanh **Quick Actions** cho phép khởi tạo Task, Note, Event hoặc Bắt đầu đếm giờ chỉ với 1 click.

### 📋 3. Quản lý Công việc & Kanban Board (Task Management)
- **Giao diện đa dạng**: Chuyển đổi linh hoạt giữa Danh sách (List), Bảng Kanban (Drag & Drop) và Lịch (Calendar).
- **Phân loại chuyên sâu**: Mức độ ưu tiên P0–P3, Trạng thái (Chưa làm, Đang làm, Chờ, Hoàn thành, Hủy), Energy Level (High/Medium/Low).
- **Tự động hóa**: Tự động tính tổng giờ làm việc thực tế (`actual_hours`) từ dữ liệu Time Tracking.

### 📁 4. Quản lý Dự án & Gantt Timeline (Project Management)
- Theo dõi Chỉ số sức khỏe dự án (**Project Health Score**).
- Tự động tính toán % tiến độ dựa trên các task thành phần.
- Cảnh báo trễ deadline và hiển thị danh sách công việc, ghi chú liên kết.

### 📅 5. Lịch Hợp Nhất (Unified Calendar)
- Chế độ xem Ngày (Day), Tuần (Week), Tháng (Month).
- Đồng bộ hiển thị sự kiện lịch, cuộc họp và deadline công việc trên cùng một giao diện trực quan.

### ⏱️ 6. Theo dõi Thời gian & Billable Hours (Time Tracking)
- **Live Timer**: Trình đếm giờ thời gian thực, tiếp tục chạy ngầm chính xác khi chuyển trang hoặc reload trình duyệt.
- **Timesheet tuần**: Báo cáo tổng số giờ làm việc theo ngày, thống kê số giờ tính phí (**Billable Hours**) và doanh thu dự kiến.
- Nhập thời gian thủ công (Manual Entry) và quản lý lịch sử làm việc.

### 📝 7. Ghi chú Thông minh & AI Copilot (Smart Notes)
- Trình soạn thảo Rich Text hiện đại (Tiptap Engine).
- **Tích hợp Gemini 1.5 Flash AI**:
  - Tóm tắt tự động nội dung ghi chú dài.
  - Trích xuất danh sách công việc cần làm (**Action Items**).
  - Trích xuất quyết định quan trọng (**Decisions**) và rủi ro (**Risks**).

### 📊 8. Phân tích Hiệu suất & Review Tuần (Analytics & Reviews)
- Biểu đồ phân bổ thời gian theo dự án và năng suất làm việc hàng ngày (Recharts).
- Đánh giá tổng kết tuần (Weekly Review) và đưa ra gợi ý tối ưu năng suất từ AI.

### 🔔 9. Nhắc việc Thông minh (Smart Reminders)
- Động cơ thông báo chạy ngầm chống gửi trùng lặp.
- Hỗ trợ thiết lập khung giờ yên tĩnh (**Quiet Hours**) để tránh làm phiền ngoài giờ làm việc.

### 📤 10. Trung tâm Xuất Dữ liệu (Export Center)
- Xuất báo cáo chuyên nghiệp ở 3 định dạng: **PDF (A4 chuẩn)**, **Excel (.xlsx)** và **CSV (UTF-8 BOM)**.
- Tùy chỉnh bộ lọc theo Dự án, Trạng thái, Ưu tiên và Khoảng thời gian.

### ⚡ 11. Tự động hóa Webhook (n8n Automation)
- Tích hợp n8n Workflow qua HTTPS Webhook.
- Bảo mật xác thực chữ ký số **HMAC SHA-256** chống giả mạo request.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG (TECH STACK)

- **Frontend Core**: [Next.js 14](https://nextjs.org/) (App Router, Server Components), [TypeScript](https://www.typescriptlang.org/) (Strict Mode).
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), Lucide Icons, Framer Motion.
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security RLS, Realtime Subscriptions).
- **Authentication**: Passkey / WebAuthn (`@simplewebauthn`), Supabase Auth.
- **State & Data Fetching**: [TanStack React Query v5](https://tanstack.com/query).
- **AI Integration**: [Google Gemini 1.5 Flash API](https://ai.google.dev/).
- **Exporting**: ExcelJS, jsPDF, AutoTable.
- **Deployment**: [Vercel](https://vercel.com/) Serverless Architecture.

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN (PROJECT STRUCTURE)

```text
PERSONAL-OS/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Cụm trang Đăng nhập / Đăng ký / Passkey
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/            # Executive Workspace Shell
│   │   ├── dashboard/          # Dashboard Widget Center
│   │   ├── tasks/              # Quản lý Task (List, Kanban)
│   │   ├── projects/           # Quản lý Dự án & Timeline
│   │   ├── calendar/           # Lịch hợp nhất
│   │   ├── time-tracking/      # Live Timer & Timesheet
│   │   ├── notes/              # Rich Text Editor & AI Copilot
│   │   ├── analytics/          # Phân tích & Báo cáo
│   │   ├── export/             # Trung tâm Xuất Báo Báo
│   │   └── settings/           # Cài đặt Hệ thống & Bảo mật Passkey
│   ├── api/                    # Next.js Route Handlers (Auth, AI, Export, Webhooks)
│   └── globals.css             # Tailored HSL Dark Mode CSS
├── components/                 # UI Components
│   ├── ui/                     # shadcn/ui primitives
│   ├── dashboard/              # Widgets điều hành
│   ├── tasks/                  # Kanban Board & Form Task
│   ├── timer/                  # Live Timer Component
│   ├── notes/                  # Tiptap Editor & AI Prompts
│   └── shared/                 # Navigation Bar, Header, Sidebar
├── lib/                        # Core Business Logic & Abstractions
│   ├── ai/                     # Gemini AI Integration
│   ├── auth/                   # Passkey & WebAuthn Helpers
│   ├── export/                 # PDF & Excel Exporters
│   ├── supabase/               # Supabase Client/Server Clients
│   └── security/               # Rate Limiting & Webhook Signing
├── docs/                       # Tài liệu Kiến trúc & Thiết kế Hệ thống
└── supabase/                   # Database Migrations & RLS Policies
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY LỰA CHỌN CỤC BỘ (LOCAL SETUP)

### 1. Phân nhánh & Tải Mã Nguồn
```bash
git clone https://github.com/facotu/PersonalOS.git
cd PersonalOS
```

### 2. Cài Đặt Dependencies
```bash
npm install
```

### 3. Cấu Hình Biến Môi Trường (`.env.local`)
Tạo file `.env.local` tại thư mục gốc dự án và điền các thông tin:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini AI API Key
GEMINI_API_KEY=your-gemini-api-key

# WebAuthn / Passkey RP ID
WEBAUTHN_RP_ID=localhost
NEXT_PUBLIC_APP_URL=http://localhost:3000

# n8n Automation Webhook Secret
N8N_WEBHOOK_SECRET=your-hmac-sha256-secret
```

### 4. Khởi Chạy Dev Server
```bash
npm run dev
```
Mở trình duyệt tại địa chỉ: `http://localhost:3000`

---

## 🔒 BẢO MẬT & ROW LEVEL SECURITY (RLS)

- Mọi bảng trong Supabase PostgreSQL đều được kích hoạt **Row Level Security (RLS)**.
- Tất cả truy vấn dữ liệu đều thực thi kiểm tra chặt chẽ điều kiện:
  ```sql
  auth.uid() = user_id
  ```
- Dữ liệu hoàn toàn độc lập, cách ly tuyệt đối giữa các người dùng.

---

## 📜 GIẤY PHÉP (LICENSE)

Dự án được phát hành theo giấy phép **MIT License**.  
Bản quyền © 2026 **Personal OS**. All rights reserved.
