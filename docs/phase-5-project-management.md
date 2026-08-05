# PERSONAL OS — PROJECT MANAGEMENT MODULE SPECIFICATION & ARCHITECTURE

## 1. TỔNG QUAN KIẾN TRÚC MODULE QUẢN LÝ DỰ ÁN (PROJECT ARCHITECTURE)

Module Quản lý Dự án (Project Management) trong Personal OS được thiết kế như một **Trung tâm quản trị mục tiêu lớn**, gom nhóm các công việc (Tasks) liên quan và cung cấp góc nhìn tổng quan cho người dùng:
1. **Tôi đang có những dự án nào?** -> Màn hình `/projects` hiển thị toàn bộ dự án đang thực hiện.
2. **Dự án nào quan trọng nhất?** -> Priority badges `P0` Khẩn cấp & `P1` Cao.
3. **Dự án đang tiến triển đến đâu?** -> Thanh tiến độ `progress_pct` được tính toán nghiêm ngặt từ số lượng task hoàn thành.
4. **Dự án nào sắp đến hạn?** -> Cảnh báo Hạn chót (Deadline) và nhãn `Quá hạn` / `Sắp đến hạn`.
5. **Còn bao nhiêu công việc chưa hoàn thành?** -> Chỉ số task summary (`completed_tasks / active_tasks`).
6. **Dự án nào đang bị chậm hoặc có nguy cơ trễ?** -> Chỉ số Project Health (`Tốt`, `Có rủi ro`, `Đang chậm`, `Quá hạn`).

---

## 2. CÔNG THỨC TÍNH TIẾN ĐỘ & HEALTH INDICATOR (FORMULAS)

### Progress Calculation Formula:
```ts
active_tasks = tasks WHERE status != 'HUY';
completed_tasks = tasks WHERE status = 'HOAN_THANH';

progress_pct = active_tasks > 0 
  ? Math.round((completed_tasks / active_tasks) * 100) 
  : 0;
```
- Ngăn ngừa hoàn toàn lỗi chia cho 0 (`NaN`) hoặc giá trị âm/vượt quá 100%.

### Project Health Indicator Rules (Rule-based):
1. **OVERDUE (Quá hạn)**: `deadline < NOW()` và `status NOT IN ('Completed', 'Archived')`.
2. **DELAYED (Đang chậm)**: `overdue_tasks_count > 0` hoặc (`deadline` trong 3 ngày và `progress_pct < 50%`).
3. **RISK (Có rủi ro)**: `deadline` trong 7 ngày và `progress_pct < 80%`.
4. **GOOD (Tốt)**: Các trường hợp còn lại hoặc `status === 'Completed'`.

---

## 3. DANH SÁCH ROUTES & COMPONENTS

### Routes:
- `/projects` — Trang danh sách dự án (Grid view + Tabs + Filters).
- `/projects/[id]` — Trang trung tâm chi tiết dự án (Overview, Tasks list context, Timeline & Gantt Foundation).

### Component Architecture:
- `components/projects/project-card.tsx`
- `components/projects/project-status-badge.tsx`
- `components/projects/project-priority-badge.tsx`
- `components/projects/project-health-badge.tsx`
- `components/projects/project-form-sheet.tsx`
- `components/projects/project-filters.tsx`
- `components/projects/project-delete-dialog.tsx`
- `components/projects/project-timeline.tsx`
- `lib/projects/types.ts`
- `lib/projects/schemas.ts`
- `lib/projects/actions.ts`

---

## 4. QUY CHUẨN BẢO MẬT & RLS ENFORCEMENT

- Mọi truy vấn PostgreSQL đều được bảo mật 100% bằng Supabase RLS `user_id = auth.uid()`.
- RLS Chain Ownership: Người dùng A không thể tạo/sửa Task gán vào `project_id` của Người dùng B.
