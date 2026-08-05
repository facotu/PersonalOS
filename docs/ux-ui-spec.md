# PERSONAL OS — UX/UI SPECIFICATION & DESIGN SYSTEM

## 1. PHONG CÁCH THIẾT KẾ (DESIGN AESTHETICS)

- **Mục tiêu**: Tối giản, sang trọng (Premium Modern Minimalist), chuyên nghiệp, tạo cảm giác kiểm soát hoàn toàn hệ thống.
- **Dark Mode mặc định**: Sử dụng tone nền tối sâu (`#090d16` / `#0f172a`), kết hợp các thẻ thông tin mờ nhẹ theo hiệu ứng Glassmorphism (`backdrop-blur-md`, border siêu mỏng `rgba(255,255,255,0.08)`).
- **Typography**: Phông chữ hiện đại **Inter** hoặc **Outfit** từ Google Fonts.
- **Hệ màu (Color Palette - HSL Tailored)**:
  - **Background**: `slate-950` (`#020617`) & `slate-900` (`#0f172a`)
  - **Surface/Card**: `slate-900/60` với viền `slate-800`
  - **Primary Accent**: Electric Indigo (`#6366f1` / `indigo-500`) & Cyan (`#06b6d4`)
  - **Priority P0**: Crimson Red (`#ef4444`)
  - **Priority P1**: Amber Yellow (`#f59e0b`)
  - **Priority P2**: Sky Blue (`#0ea5e9`)
  - **Priority P3**: Slate Gray (`#94a3b8`)
  - **Status Success**: Emerald Green (`#10b981`)

---

## 2. BỐ CỤC CHÍNH (MAIN APP LAYOUT)

```
+-------------------------------------------------------------------------+
| [Logo] Personal OS    [Search/Cmd+K]    (Timer Running 01:24)  [Profile]|
+--------------+----------------------------------------------------------+
|  Sidebar     |  Main Content Workspace                                  |
|  - Dashboard |                                                          |
|  - Tasks     |  [Header & Filter Bar]                                   |
|  - Projects  |  +----------------------------------------------------+  |
|  - Calendar  |  | Widget / View Content                              |  |
|  - Timer     |  |                                                    |  |
|  - Notes     |  |                                                    |  |
|  - Analytics |  +----------------------------------------------------+  |
|  - Review    |                                                          |
|              |                                                          |
|  [+ Quick]   |                                                          |
+--------------+----------------------------------------------------------+
```

---

## 3. CHI TIẾT CÁC MÀN HÌNH CHÍNH

### 3.1 Dashboard Layout (Trung tâm điều hành)
- **Top Bar Widget**: "Xin chào, Nguyễn Văn A — Hôm nay là Thứ Tư, 05/08/2026".
- **Grid Layout (3 cột Desktop, 1 cột Mobile)**:
  - **Cột 1 (Ưu tiên & Hôm nay)**: Top 3 Tasks P0/P1 + List Task Today.
  - **Cột 2 (Lịch & Deadline)**: Schedule Widget (Events hôm nay) + Overdue Alert Banner.
  - **Cột 3 (Tiến độ & Năng suất)**: Live Time Tracker Card + Project Progress Bars + Focus Score Gauge.

### 3.2 View Công việc (Task Views)
- **Header Actions**: Switch view tabs (`Hôm nay` | `Tuần này` | `Quá hạn` | `Kanban` | `Calendar`).
- **Kanban Board**: 5 cột trạng thái (`Chưa làm`, `Đang làm`, `Chờ`, `Hoàn thành`, `Hủy`) có đếm số lượng task, hỗ trợ drag-and-drop với hiệu ứng phản hồi mượt.
- **Task Card Component**:
  - Badge Priority (P0, P1, P2, P3).
  - Tên công việc & tên Dự án liên kết (nếu có).
  - Hạn chót (Due date) với màu cảnh báo (Đỏ nếu trễ, Vàng nếu còn < 24h).
  - Năng lượng (Energy tag: High/Medium/Low).
  - Progress bar % hoàn thành & số giờ đã tích lũy (`1.5h / 3h`).

### 3.3 Ghi chú Smart & AI Copilot Drawer
- **Bố cục 2 Panel**:
  - Panel Trái: Danh sách Notes có tìm kiếm & filter theo Tag/Project.
  - Panel Phải: Editor chính (Rich-text Tiptap) + Nút **"AI Copilot"**.
- **AI Drawer**: Trượt từ bên phải sang khi bấm AI Copilot:
  - Hiển thị kết quả Tóm tắt (Summary).
  - Danh sách Checkbox "Action Items" cho phép duyệt tạo Task chỉ với 1 click.
  - Cảnh báo rủi ro & đề xuất tag.

### 3.4 Command Palette (`Cmd + K` / `Ctrl + K`)
- Cho phép người dùng thực hiện mọi hành động không cần dùng chuột:
  - `> Tạo task mới...`
  - `> Bắt đầu đếm giờ...`
  - `> Tạo ghi chú nhanh...`
  - `> Đi tới Dashboard...`

---

## 4. QUY TẮC HIỆU ỨNG & INTERACTION

- KHÔNG sử dụng animation quá 300ms gây giật lag.
- Sử dụng Framer Motion cho:
  - Layout transition nhẹ nhàng khi đổi tab.
  - Modal trượt vào mượt (Slide-in / Fade-in).
  - Pulse ring đỏ quanh đồng hồ Live Timer đang chạy.
