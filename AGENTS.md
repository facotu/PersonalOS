# AGENTS GUIDELINES & WORKFLOW — PERSONAL OS

Tài liệu này quy định tất cả các quy tắc, chuẩn mực mã nguồn và quy trình làm việc mà bất kỳ AI Agent hoặc Developer nào cũng phải tuân thủ khi làm việc trên repository **PERSONAL OS**.

---

## 1. QUY TẮC CỐT LÕI (CORE RULES)

1. **Không code tự phát**: Không tự ý thêm bớt tính năng ngoài phạm vi đã nêu trong `/docs/product-requirements.md` và `/docs/implementation-plan.md`.
2. **Strict TypeScript**: Sử dụng `TypeScript` nghiêm ngặt (`noImplicitAny: true`, không dùng `any` bừa bãi).
3. **Tiếng Việt Mặc Định**: Toàn bộ nhãn UI, thông báo lỗi, gợi ý placeholder và thông báo từ AI phải là **Tiếng Việt chuẩn xác**.
4. **Bảo mật RLS trên hết**: Mọi câu query Supabase đều phải kiểm tra và xác thực Row Level Security (`auth.uid() = user_id`).
5. **Zero Superficial Patches**: Không sửa lỗi bằng cách nuốt Exception, comment out test bị fail hoặc mock dữ liệu ảo để đối phó.
6. **No Hardcoded Secrets**: Không bao giờ đưa API key, Bearer tokens hoặc connection string vào mã nguồn. Luôn dùng `process.env`.

---

## 2. CẤU TRÚC THƯ MỤC DỰ ÁN (PROJECT DIRECTORY STRUCTURE)

```
/
├── .env.example              # Mẫu biến môi trường
├── AGENTS.md                 # Quy tắc cho Agent (Tệp này)
├── docs/                     # Tài liệu thiết kế hệ thống
│   ├── product-requirements.md
│   ├── architecture.md
│   ├── database-schema.md
│   ├── api-spec.md
│   ├── ux-ui-spec.md
│   ├── automation-spec.md
│   ├── security-spec.md
│   ├── testing-strategy.md
│   └── implementation-plan.md
├── app/                      # Next.js App Router
│   ├── (auth)/               # Pages Đăng nhập / Đăng ký / Passkey
│   ├── (dashboard)/          # Application Workspace & Shell
│   │   ├── dashboard/        # Dashboard Widget Center
│   │   ├── tasks/            # Task Management Views
│   │   ├── projects/         # Project Management & Timeline
│   │   ├── calendar/         # Full Calendar View
│   │   ├── time-tracking/    # Live Timer & Sessions Log
│   │   ├── notes/            # Rich Text Editor & AI Copilot
│   │   ├── analytics/        # Recharts Analytics
│   │   └── reviews/          # Weekly Reviews
│   ├── api/                  # Next.js Route Handlers (Auth, AI, Export, Webhooks)
│   └── globals.css           # Tailwind CSS & Global Styles
├── components/               # UI Components
│   ├── ui/                   # shadcn/ui primitives
│   ├── dashboard/            # Dashboard specific widgets
│   ├── tasks/                # Task Kanban, List, Forms
│   ├── timer/                # Live Timer component
│   └── shared/               # Navigation, Header, Command Palette
├── lib/                      # Business Logic & Core Utilities
│   ├── ai/                   # Gemini AI Abstraction Layer
│   ├── supabase/             # Client & Server Supabase setup
│   ├── export/               # PDF & Excel exporters
│   ├── security/             # Rate Limiting & Webhook signing
│   └── utils.ts              # Helper functions
└── supabase/                 # Supabase SQL Migrations & Seed data
```

---

## 3. THIẾT KẾ UI & CHUẨN MỰC GIAO DIỆN

- **Màu sắc**: Sử dụng Tailored HSL Colors trong `tailwind.config.ts`.
- **Dark Mode**: Là chế độ hiển thị mặc định (`dark`).
- **Minimalist**: Khoảng trắng cân đối (`padding`, `gap` hợp lý), typography rõ ràng, không dùng quá nhiều màu sắc sặc sỡ.
- **Micro-interactions**: Sử dụng Framer Motion vừa phải cho dialogs, drawers và page transitions.

---

## 4. QUY TRÌNH THỰC THI CHO AI AGENT

Khi thực hiện một Phase trong `implementation-plan.md`:
1. **Đọc tài liệu tương ứng** trong thư mục `/docs/`.
2. **Kiểm tra trạng thái hiện tại** của mã nguồn bằng cách xem file trước khi chỉnh sửa.
3. **Thực thi mã nguồn**: Tạo mới hoặc chỉnh sửa file với đầy đủ types và Zod validation.
4. **Kiểm tra & Xác minh**: Chạy thử test hoặc build check (`npm run build` / `npm run test`).
5. **Cập nhật báo cáo**: Báo cáo rõ ràng công việc đã làm cho người dùng.
