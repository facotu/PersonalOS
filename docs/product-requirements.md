# PERSONAL OS — PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1. DỔNG QUAN SẢN PHẨM (PRODUCT OVERVIEW)

### 1.1 Tên sản phẩm
**PERSONAL OS — TRUNG TÂM ĐIỀU HÀNH CÔNG VIỆC CÁ NHÂN**

### 1.2 Tầm nhìn (Vision)
PERSONAL OS là một hệ điều hành cá nhân hóa giúp người dùng tối ưu hóa năng suất, quản lý dự án, theo dõi thời gian, lưu trữ ghi chú và tự động hóa quy trình làm việc trên một giao diện hiện đại, tối giản, trực quan và bảo mật.

### 1.3 Ngôn ngữ & Phạm vi
- **Ngôn ngữ mặc định**: Tiếng Việt (UI & AI Response).
- **Thiết bị hỗ trợ**: Web Responsive (Desktop-first, tối ưu mượt mà cho Tablet và Mobile).
- **Chế độ hiển thị**: Dark Mode mặc định, hỗ trợ Light Mode theo hệ thống.

---

## 2. NGUYÊN TẮC THIẾT KẾ UX/UI (DESIGN PRINCIPLES)

1. **Minimal & Professional**: Giao diện tinh tế, tập trung vào dữ liệu quan trọng, khoảng trắng hợp lý, typography rõ ràng.
2. **Fast & Responsive**: Thời gian phản hồi < 100ms cho các thao tác local, đồng bộ realtime qua Cloud.
3. **Minimal Clicks**: Giảm thiểu tối đa số lần nhấp chuột (Quick Actions, Command Palette `Cmd+K` / `Ctrl+K`).
4. **Keyboard Friendly**: Hỗ trợ phím tắt cho tất cả hành động chính.
5. **Accessibility (a11y)**: Chuẩn WCAG 2.1 AA, hỗ trợ đọc màn hình và tương tác hoàn toàn bằng bàn phím.

---

## 3. CHI TIẾT CÁC MODULE CHÍNH & ACCEPTANCE CRITERIA

### Module 1: Dashboard (Trung tâm điều hành)
- **Chức năng**:
  - Lời chào cá nhân hóa theo thời gian thực (Sáng/Chiều/Tối).
  - Hiển thị ngày tháng năm âm dương / thứ trong tuần.
  - **Top 3 ưu tiên lớn nhất** trong ngày (Priority P0/P1).
  - Danh sách công việc hôm nay (Today's Tasks) & Công việc quá hạn (Overdue Tasks).
  - Timeline lịch hôm nay (Calendar Widget) & các Deadline sắp tới trong 7 ngày.
  - Tiến độ dự án đang chạy (Project Progress Overview).
  - Báo cáo thời gian làm việc hôm nay (Today's Tracked Time breakdown).
  - Thanh **Quick Actions**: Tạo nhanh Task, Note, Start Timer, Log Event.
- **Acceptance Criteria**:
  - Hiển thị chính xác dữ liệu theo `user_id` đang đăng nhập.
  - Dashboard load dưới 500ms.
  - Có nút 1-click chuyển nhanh từ Overdue Task thành Today Task.

### Module 2: Quản lý Công việc (Tasks)
- **Cấu trúc Dữ liệu Task**:
  - `id` (UUID), `title` (String), `description` (Rich Text / Markdown), `project_id` (FK optional).
  - `status`: `CHUA_LAM` (Chưa làm), `DANG_LAM` (Đang làm), `CHO` (Chờ), `HOAN_THANH` (Hoàn thành), `HUY` (Hủy).
  - `priority`: `P0` (Khẩn cấp & Quan trọng), `P1` (Quan trọng), `P2` (Bình thường), `P3` (Thấp).
  - `start_date`, `due_date`, `completion_pct` (0-100%).
  - `estimated_hours` (Giờ dự kiến), `actual_hours` (Giờ thực tế - tự động tính từ Time Tracking).
  - `energy_level`: `HIGH` (Năng lượng cao), `MEDIUM` (Vừa), `LOW` (Thấp).
  - `tags` (Array string), `user_id` (FK), `created_at`, `updated_at`, `deleted_at`.
- **Views hỗ trợ**:
  - **Hôm nay**: Lọc công việc có `due_date` = today hoặc `status` = DANG_LAM.
  - **Tuần này**: Xem công việc theo mốc 7 ngày tới.
  - **Quá hạn**: Lọc công việc chưa xong và `due_date` < current_date.
  - **Tất cả**: Nhóm theo Dự án / Priority / Status.
  - **Kanban Board**: Drag and drop chuyển trạng thái giữa các cột status.
  - **Calendar View**: Xem trực quan theo ngày/tuần/tháng.
- **Acceptance Criteria**:
  - Kéo thả mượt mà trên Kanban view.
  - Tự động cập nhật `actual_hours` khi kết thúc Time Session liên kết.

### Module 3: Quản lý Dự án (Projects)
- **Cấu trúc Project**:
  - `id`, `name`, `goal` (Mục tiêu), `description`, `status` (Planning, Active, Paused, Completed, Archived), `priority` (P0-P3).
  - `start_date`, `deadline`, `progress_pct` (Tự động tính từ % Task hoàn thành).
  - Tab chi tiết: Tasks list, Notes liên kết, Activity log, Time Tracking summary.
  - Timeline View (Gantt chart đơn giản hiển thị phụ thuộc thời gian).
- **Acceptance Criteria**:
  - Tính % hoàn thành tự động dựa trên tổng số task và số task hoàn thành trong project.
  - Hiển thị trực quan cảnh báo khi dự án có rủi ro trễ deadline.

### Module 4: Lịch (Calendar)
- **Chức năng**:
  - Chế độ xem: Day View, Week View, Month View.
  - Tích hợp hiển thị: Task start/due dates, Calendar Events, Meetings.
  - Hỗ trợ kéo thả thay đổi giờ bắt đầu / deadline của Task.
- **Acceptance Criteria**:
  - Phân biệt rõ ràng màu sắc giữa Task Deadline, Event và Meeting.
  - Đồng bộ thời gian thực khi chỉnh sửa trên Lịch.

### Module 5: Theo dõi Thời gian (Time Tracking)
- **Chức năng**:
  - Live Timer (START SESSION / STOP SESSION).
  - Manual Log (Nhập giờ thủ công).
  - Trường dữ liệu session: `task_id`, `project_id`, `start_time`, `end_time`, `duration_minutes`, `type` (Tập trung, Họp, Hành chính, Nghỉ, Khác), `focus_score` (1-10), `notes`.
- **Acceptance Criteria**:
  - Live timer tiếp tục chạy đúng khi chuyển tab hoặc reload trang (lưu local storage + server state).
  - Tự động cộng dồn `actual_hours` vào Task & Project tương ứng.

### Module 6: Ghi chú Smart (Notes & AI Assistance)
- **Chức năng Editor**:
  - Trình soạn thảo Rich Text (Block-based / Tiptap), hỗ trợ code block, checklist, tables.
  - Gắn tag, liên kết Project, liên kết Task, đính kèm Tệp (Attachments).
- **AI Copilot (Gemini Integration)**:
  - **Summary**: Tóm tắt tự động nội dung ghi chú dài.
  - **Action Items**: Trích xuất các công việc cần làm từ cuộc họp / ghi chú.
  - **Decisions**: Trích xuất quyết định quan trọng.
  - **Deadline Extraction**: Tự động phát hiện ngày hạn chót được đề cập trong text.
  - **Risk Detection**: Cảnh báo rủi ro về tiến độ / tài nguyên.
  - **Auto-Classification**: Tự động gợi ý tags và danh mục ghi chú.
- **Acceptance Criteria**:
  - AI phản hồi dưới 3 giây qua streaming response.
  - Cho phép người dùng xem trước và duyệt (Approve) trước khi AI tạo Task tự động từ Action Items.

### Module 7: Phân tích Tuần (Weekly Analytics)
- **Chỉ số (Metrics)**:
  - Tổng Task, Task Hoàn thành, Task Quá hạn, Completion Rate (%).
  - Tổng giờ làm việc, Focus Hours (Giờ tập trung), Average Focus Score.
  - Tiến độ trung bình các dự án active.
  - So sánh Giờ ước tính vs Giờ thực tế (Estimated vs Actual).
- **Biểu đồ (Charts - Recharts)**:
  - Biểu đồ cột: Task hoàn thành theo ngày trong tuần.
  - Biểu đồ đường: Focus hours & Focus score xu hướng 7 ngày.
  - Biểu đồ tròn: Phân bổ thời gian (Time allocation by type/project).
  - Biểu đồ so sánh: Estimated vs Actual Hours per project.

### Module 8: Báo cáo Tuần (Weekly Review)
- **Tự động hóa**:
  - Vào cuối tuần (Chủ nhật 20:00), hệ thống tự động tổng hợp draft báo cáo:
    1. Các việc đã hoàn thành trong tuần.
    2. Các việc chưa hoàn thành / trễ hạn.
    3. Phân tích tổng thời gian làm việc & năng suất.
    4. Dự án nổi bật & Dự án có nguy cơ trễ.
    5. Điểm hiệu suất chung (Performance Score 1-100).
    6. Đề xuất cải thiện từ AI.
    7. Thiết lập Top 3 ưu tiên cho tuần sau.
- **Acceptance Criteria**:
  - Báo cáo có thể chỉnh sửa, xuất file PDF/XLSX hoặc lưu thành Note.

### Module 9 & 10: Smart Reminders & Daily Brief
- **Smart Reminders**:
  - Cảnh báo trước 24h, trước 1h khi Task trễ hạn.
  - Cảnh báo ngay khi Task chuyển sang trạng thái Overdue.
  - Thông báo xuất hiện trên In-app Notification center & Web Push Notification.
- **Daily Brief**:
  - Tự động tạo mỗi 07:30 sáng: 3 ưu tiên hàng đầu, Deadline trong ngày, Task quá hạn, Lịch làm việc hôm nay, Mục tiêu năng lượng.

### Module 11: Xuất Báo cáo (Export PDF / XLSX / CSV)
- **Chức năng Export**:
  - Export danh sách Tasks, Projects, Time Sessions ra CSV / Excel (.xlsx).
  - Export Weekly Analytics & Weekly Review ra PDF đẹp chuẩn in ấn (Professional layout, Dark/Light theme).
- **Acceptance Criteria**:
  - Tệp XLSX có định dạng cột chuẩn, format ngày tháng và công số hợp lý.
  - Tệp PDF không bị gãy trang (page-break hợp lý), chứa logo và biểu đồ nét.

### Module 12: Xác thực & Bảo mật (Authentication & Passkey)
- **Phương thức Auth**:
  - Email / Password (xác thực OTP / Magic Link).
  - Google OAuth 2.0.
  - **Passkey / WebAuthn**: Hỗ trợ Face ID / Touch ID / Windows Hello trực tiếp trên thiết bị người dùng.
- **Bảo mật**:
  - Supabase Row Level Security (RLS) bắt buộc trên 100% bảng.
  - Mã hóa dữ liệu truyền tải (HTTPS/TLS) và dữ liệu lưu trữ.
  - Session expiration & Token refresh tự động.

### Module 13: Đồng bộ Đa thiết bị (Cloud Sync)
- **Cơ chế**:
  - Supabase Realtime WebSocket subscription.
  - Tự động đồng bộ trạng thái giữa Desktop, Mobile browser và Tablet mà không cần reload trang.
