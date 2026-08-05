import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập địa chỉ email.")
    .email("Địa chỉ email không đúng định dạng."),
  password: z
    .string()
    .min(6, "Mật khẩu phải có tối thiểu 6 ký tự."),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Họ và tên phải có tối thiểu 2 ký tự."),
    email: z
      .string()
      .min(1, "Vui lòng nhập địa chỉ email.")
      .email("Địa chỉ email không đúng định dạng."),
    password: z
      .string()
      .min(6, "Mật khẩu phải có tối thiểu 6 ký tự."),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không trùng khớp.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập địa chỉ email.")
    .email("Địa chỉ email không đúng định dạng."),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Mật khẩu phải có tối thiểu 6 ký tự."),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không trùng khớp.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
