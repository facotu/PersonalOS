# PERSONAL OS — API SPECIFICATION & ROUTE HANDLERS

## 1. NGUYÊN TẮC THIẾT KẾ API

- **Định dạng dữ liệu**: RESTful Route Handlers & Next.js Server Actions (JSON Payload & Response).
- **Xác thực**: Tất cả API bắt buộc yêu cầu Cookie Session Supabase Auth hợp lệ (`auth.uid()`).
- **Validation**: Sử dụng thư viện `zod` để validate toàn bộ đầu vào Client trước khi query DB.
- **Mã lỗi chuẩn HTTP**:
  - `200 OK`: Thành công.
  - `400 Bad Request`: Thiếu dữ liệu hoặc sai định dạng.
  - `401 Unauthorized`: Chưa đăng nhập.
  - `403 Forbidden`: Quyền truy cập không hợp lệ.
  - `429 Too Many Requests`: Vượt quá Rate Limit (ví dụ 100 request/phút).
  - `500 Internal Server Error`: Lỗi Server.

---

## 2. DANH SÁCH ENDPOINTS CHI TIẾT

### 2.1 Passkey / WebAuthn Endpoints

#### POST `/api/auth/passkey/register-challenge`
- **Mục đích**: Lấy Challenge từ Server để đăng ký Passkey mới qua Touch ID / Face ID.
- **Response**: `{ challenge: string, rp: { name: string, id: string }, user: { id: string, name: string } }`

#### POST `/api/auth/passkey/register-verify`
- **Mục đích**: Xác thực kết quả đăng ký từ thiết bị và lưu Public Key vào Supabase.
- **Body**: `{ credentialId: string, publicKey: string, deviceName: string }`

---

### 2.2 Task Management Endpoints & Server Actions

#### GET `/api/tasks`
- **Query Params**: `status`, `priority`, `project_id`, `view` (`today`|`week`|`overdue`|`all`)
- **Response**: `Task[]`

#### POST `/api/tasks`
- **Body (Zod Schema)**:
  ```json
  {
    "title": "Soạn thảo báo cáo tài chính Q3",
    "description": "Cần kiểm tra lại số liệu từ hóa đơn...",
    "project_id": "8f2b7a9e-...",
    "priority": "P1",
    "status": "CHUA_LAM",
    "due_date": "2026-08-10T17:00:00Z",
    "estimated_hours": 3.5,
    "energy_level": "HIGH",
    "tags": ["Finance", "Report"]
  }
  ```

#### PATCH `/api/tasks/[id]`
- **Body**: Cập nhật trạng thái (`status`), % hoàn thành (`completion_pct`), thứ tự (`sort_order`).

---

### 2.3 Time Tracking Endpoints

#### POST `/api/time-sessions/start`
- **Body**: `{ task_id?: string, project_id?: string, session_type: "TapTrung"|"Hop"|"HanhChinh" }`
- **Response**: `{ session_id: string, start_time: string }`

#### POST `/api/time-sessions/stop`
- **Body**: `{ session_id: string, focus_score: 8, notes: "Hoàn thành 80% công việc" }`
- **Response**: `{ session_id: string, duration_minutes: 120, actual_hours_updated: true }`

---

### 2.4 AI Copilot Endpoints (Gemini Layer)

#### POST `/api/ai/analyze-note`
- **Body**: `{ note_id: string, content: string }`
- **Response**:
  ```json
  {
    "summary": "Tóm tắt 3 điểm chính trong cuộc họp...",
    "actionItems": [
      { "title": "Gửi email xác nhận kế hoạch", "priority": "P1", "estimatedHours": 0.5 }
    ],
    "decisions": ["Thông qua ngân sách 50 triệu"],
    "deadlines": [{ "text": "Nộp bản thảo trước thứ 6", "extractedDate": "2026-08-07T17:00:00Z" }],
    "risks": ["Thiếu nhân sự thiết kế UI"],
    "suggestedTags": ["Meeting", "Finance"]
  }
  ```

#### POST `/api/ai/daily-brief`
- **Mục đích**: Tạo nội dung Daily Brief sáng cho người dùng.
- **Response**: `{ priorities: string[], deadlinesToday: string[], overdueCount: number, dailyTargetNote: string }`

#### POST `/api/ai/weekly-review`
- **Mục đích**: Tự động tổng hợp dữ liệu 7 ngày qua và tạo draft Weekly Review.

---

### 2.5 Export Endpoints

#### GET `/api/export/pdf`
- **Query Params**: `type` (`weekly_analytics`|`weekly_review`|`project_report`), `id`
- **Response**: Binary PDF File (`Content-Type: application/pdf`)

#### GET `/api/export/xlsx`
- **Query Params**: `type` (`tasks`|`time_sessions`|`analytics`)
- **Response**: Binary Excel File (`Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)

---

### 2.6 Automation & Webhook Endpoints (n8n Integration)

#### POST `/api/v1/webhooks/n8n/trigger-reminder`
- **Header**: `X-Webhook-Secret: <SECRET_KEY>`
- **Body**: `{ user_id: string, reminder_type: "DEADLINE_24H"|"DAILY_BRIEF" }`
- **Response**: `{ success: true, notification_created: true }`
