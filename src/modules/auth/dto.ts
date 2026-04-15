import { z } from "zod";

export const LoginBodySchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1, "Password is required"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ChangePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(6, "New password must be at least 6 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const SignupRequestOtpSchema = z.object({
  full_name: z.string().min(1).max(150),
  username: z.string().min(4).max(20).regex(/^[a-z_]+$/, "Only lowercase letters & underscore allowed"),
  email: z.string().email().max(191),
  mobile_number: z.string().regex(/^\d+$/, "Only digits").min(10).max(13),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const SignupResendOtpSchema = z.object({
  email: z.string().email(),
});

export const SignupVerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const SessionIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid session ID").transform(Number),
});
