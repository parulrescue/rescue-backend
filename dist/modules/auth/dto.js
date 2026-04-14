"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionIdParamSchema = exports.ChangePasswordSchema = exports.ResetPasswordSchema = exports.ForgotPasswordSchema = exports.LoginBodySchema = void 0;
const zod_1 = require("zod");
exports.LoginBodySchema = zod_1.z.object({
    email: zod_1.z.string().email().max(255),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.ForgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
exports.ResetPasswordSchema = zod_1.z
    .object({
    token: zod_1.z.string().min(1, "Token is required"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: zod_1.z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
exports.ChangePasswordSchema = zod_1.z
    .object({
    current_password: zod_1.z.string().min(1, "Current password is required"),
    new_password: zod_1.z.string().min(6, "New password must be at least 6 characters"),
    confirm_password: zod_1.z.string(),
})
    .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
});
exports.SessionIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/, "Invalid session ID").transform(Number),
});
