# PERSONAL OS — TESTING STRATEGY & ACCEPTANCE TEST PLAN

## 1. CHIẾN LƯỢC KIỂM THỬ TỔNG THỂ (TESTING STRATEGY)

Personal OS thực thi chiến lược kiểm thử đa tầng (Multi-tier Testing) nhằm đảm bảo hệ thống chạy ổn định, không có lỗi tiềm ẩn và tuân thủ các quy tắc bảo mật.

```
       / \
      / E2E \       <- Playwright (Luồng người dùng chính, Export, Auth)
     /-------\
    / Component\    <- React Testing Library (Render UI, Form, Buttons)
   /-------------\
  / Integration & \  <- Vitest / Jest (Server Actions, RLS Policies, Zod Validation)
 /    Unit Tests   \
---------------------
```

---

## 2. MA TRẬN KIỂM THỬ CÁC MODULE (ACCEPTANCE TEST PLAN)

| Module | Kịch bản kiểm thử (Test Case) | Kết quả kỳ vọng (Expected Result) | Loại Test |
| :--- | :--- | :--- | :--- |
| **Auth** | Đăng nhập bằng Email/Password sai | Hiển thị lỗi Tiếng Việt rõ ràng, không crash UI. | Integration |
| **Passkey** | Đăng ký Touch ID / Face ID trên thiết bị | Tạo thành công Passkey Credential và đăng nhập được lần sau. | E2E |
| **Tasks** | Tạo Task mới với Priority P0 và Due Date hôm nay | Task xuất hiện ngay ở Top 3 Priority trên Dashboard & Cột Kanban. | E2E |
| **Tasks** | Kéo thả chuyển trạng thái Task trên Kanban | Trạng thái cập nhật tức thì (Optimistic) & lưu đúng vào PostgreSQL. | Component |
| **Timer** | Bấm START SESSION, chuyển tab 30 phút rồi quay lại | Đếm giờ tiếp tục chạy đúng `00:30:00`, không bị reset. | E2E |
| **Timer** | STOP SESSION và lưu focus score 9/10 | Số giờ làm việc thực tế (`actual_hours`) của Task & Project tự động tăng. | Integration |
| **AI Copilot**| Nhập ghi chú cuộc họp và bấm "AI Copilot" | Trả về Summary, 3 Action Items và gợi ý Deadline dưới 3 giây. | Unit / Integration |
| **Export** | Bấm xuất báo cáo tuần ra XLSX & PDF | Tải xuống thành công file PDF nét căng và file XLSX đầy đủ số liệu. | E2E |
| **RLS DB** | User A cố gắng fetch Task của User B bằng ID | Supabase RLS từ chối request, trả về mảng rỗng hoặc lỗi 403. | DB Unit Test |

---

## 3. THỰC THI KIỂM THỬ TỰ ĐỘNG

- **Chạy Unit & Integration Tests**: `npm run test`
- **Chạy End-to-End Tests**: `npm run test:e2e`
- **Kiểm thử Database RLS**: `npx supabase test db`
