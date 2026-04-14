"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = loginUser;
exports.logoutUser = logoutUser;
exports.getUserSessions = getUserSessions;
exports.revokeSession = revokeSession;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.changePassword = changePassword;
const sequelize_1 = require("sequelize");
const user_model_1 = require("../../db/models/auth/user.model");
const session_model_1 = require("../../db/models/auth/session.model");
const password_reset_token_model_1 = require("../../db/models/auth/password-reset-token.model");
const password_1 = require("../../shared/security/password");
const jwt_1 = require("../../shared/security/jwt");
const crypto_1 = require("../../shared/security/crypto");
const email_service_1 = require("../../services/email.service");
const response_1 = require("../../shared/http/response");
const status_1 = require("../../shared/http/status");
const config_1 = require("../../config");
async function loginUser(req) {
    try {
        const { email, password } = req.body;
        const deviceInfo = req.headers["user-agent"] || null;
        const ipAddress = req.clientInfo?.ipv4 || req.clientInfo?.ip || null;
        const user = await user_model_1.User.findOne({ where: { email }, raw: true });
        if (!user) {
            return (0, response_1.error)(status_1.HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        if (!user.is_active) {
            return (0, response_1.error)(status_1.HttpStatus.FORBIDDEN, "Account is deactivated");
        }
        const valid = await (0, password_1.verifyPassword)(password, user.password_hash);
        if (!valid) {
            return (0, response_1.error)(status_1.HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        // Create session
        const expiresAt = (0, jwt_1.getExpiryDate)();
        const session = await session_model_1.Session.create({
            user_id: user.id,
            user_type: "user",
            token_hash: "", // placeholder, will update after generating token
            device_info: deviceInfo,
            ip_address: ipAddress,
            is_active: true,
            expires_at: expiresAt,
        });
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            userType: "user",
            sessionId: session.id,
        });
        // Store SHA-256 hash of the token
        await session.update({ token_hash: (0, jwt_1.hashToken)(token) });
        return (0, response_1.success)("Login successful", {
            user: {
                id: user.id,
                full_name: user.full_name,
                username: user.username,
                email: user.email,
                mobile_number: user.mobile_number,
                profile_pic: user.profile_pic,
            },
            token,
            expiresAt,
        });
    }
    catch (err) {
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Login failed");
    }
}
async function logoutUser(req) {
    try {
        const session = await session_model_1.Session.findByPk(req.sessionId);
        if (!session) {
            return (0, response_1.error)(status_1.HttpStatus.NOT_FOUND, "Session not found");
        }
        await session.update({ is_active: false });
        return (0, response_1.success)("Logged out successfully");
    }
    catch (err) {
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Logout failed");
    }
}
async function getUserSessions(req) {
    try {
        const sessions = await session_model_1.Session.findAll({
            where: {
                user_id: req.userId,
                user_type: "user",
                is_active: true,
                expires_at: { [sequelize_1.Op.gt]: new Date() },
            },
            attributes: ["id", "device_info", "ip_address", "createdAt", "expires_at"],
            order: [["createdAt", "DESC"]],
            raw: true,
        });
        return (0, response_1.success)("Sessions fetched", sessions);
    }
    catch (err) {
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to fetch sessions");
    }
}
async function revokeSession(req) {
    try {
        const { id } = req.params;
        const session = await session_model_1.Session.findOne({
            where: { id, user_id: req.userId, user_type: "user" },
        });
        if (!session) {
            return (0, response_1.error)(status_1.HttpStatus.NOT_FOUND, "Session not found");
        }
        await session.update({ is_active: false });
        return (0, response_1.success)("Session revoked successfully");
    }
    catch (err) {
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to revoke session");
    }
}
async function forgotPassword(req) {
    try {
        const { email } = req.body;
        const user = await user_model_1.User.findOne({ where: { email }, raw: true });
        // Always return success to prevent email enumeration
        if (!user) {
            return (0, response_1.error)(status_1.HttpStatus.BAD_REQUEST, "email does not registered");
        }
        // Invalidate any existing unused tokens for this user
        await password_reset_token_model_1.PasswordResetToken.update({ used: true }, { where: { user_id: user.id, user_type: "user", used: false } });
        // Generate token
        const { raw, hash } = (0, crypto_1.generateResetToken)();
        await password_reset_token_model_1.PasswordResetToken.create({
            user_id: user.id,
            user_type: "user",
            token_hash: hash,
            expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
            used: false,
        });
        const resetLink = `${config_1.config.cors.frontendUrl}/reset-password?token=${raw}`;
        try {
            await (0, email_service_1.sendPasswordResetEmail)(user.email, user.full_name, resetLink);
        }
        catch (emailErr) {
            console.error("Failed to send password reset email:", emailErr);
        }
        return (0, response_1.success)("reset link has been sent");
    }
    catch (err) {
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Forgot password failed");
    }
}
async function resetPassword(req) {
    try {
        const { token, password } = req.body;
        const tokenHash = (0, crypto_1.hashResetToken)(token);
        const resetToken = await password_reset_token_model_1.PasswordResetToken.findOne({
            where: {
                token_hash: tokenHash,
                user_type: "user",
                used: false,
                expires_at: { [sequelize_1.Op.gt]: new Date() },
            },
        });
        if (!resetToken) {
            return (0, response_1.error)(status_1.HttpStatus.BAD_REQUEST, "Invalid or expired reset token");
        }
        const user = await user_model_1.User.findByPk(resetToken.user_id);
        if (!user) {
            return (0, response_1.error)(status_1.HttpStatus.NOT_FOUND, "User not found");
        }
        const hash = await (0, password_1.hashPassword)(password);
        const encryptedPlain = (0, crypto_1.encryptAES)(password);
        await user.update({ password_hash: hash, password_plain: encryptedPlain });
        // Mark token as used
        await resetToken.update({ used: true });
        // Revoke all active sessions
        await session_model_1.Session.update({ is_active: false }, { where: { user_id: user.id, user_type: "user", is_active: true } });
        return (0, response_1.success)("Password reset successfully");
    }
    catch (err) {
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Password reset failed");
    }
}
async function changePassword(req) {
    try {
        const { current_password, new_password } = req.body;
        const user = await user_model_1.User.findByPk(req.userId, { raw: true });
        if (!user) {
            return (0, response_1.error)(status_1.HttpStatus.NOT_FOUND, "User not found");
        }
        const valid = await (0, password_1.verifyPassword)(current_password, user.password_hash);
        if (!valid) {
            return (0, response_1.error)(status_1.HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        const hash = await (0, password_1.hashPassword)(new_password);
        const encryptedPlain = (0, crypto_1.encryptAES)(new_password);
        await user_model_1.User.update({ password_hash: hash, password_plain: encryptedPlain }, { where: { id: req.userId } });
        return (0, response_1.success)("Password changed successfully");
    }
    catch (err) {
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Change password failed");
    }
}
