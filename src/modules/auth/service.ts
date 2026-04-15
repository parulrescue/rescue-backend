import { FastifyRequest } from "fastify";
import { Op } from "sequelize";
import { User } from "../../db/models/auth/user.model";
import { Session } from "../../db/models/auth/session.model";
import { PasswordResetToken } from "../../db/models/auth/password-reset-token.model";
import { SignupOtp } from "../../db/models/auth/signup-otp.model";
import { hashPassword, verifyPassword } from "../../shared/security/password";
import { generateToken, hashToken, getExpiryDate } from "../../shared/security/jwt";
import { generateResetToken, hashResetToken, encryptAES } from "../../shared/security/crypto";
import { sendPasswordResetEmail, sendSignupOtpEmail, sendRegistrationNotificationEmail } from "../../services/email.service";
import crypto from "crypto";

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

function generateOtp(): string {
  return crypto.randomInt(0, 1000000).toString().padStart(6, "0");
}

import { success, error } from "../../shared/http/response";
import { HttpStatus } from "../../shared/http/status";
import { config } from "../../config";

export async function loginUser(req: FastifyRequest) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const deviceInfo = req.headers["user-agent"] || null;
    const ipAddress = req.clientInfo?.ipv4 || req.clientInfo?.ip || null;

    const user = await User.findOne({ where: { email }, raw: true });
    if (!user) {
      return error(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    if (!user.is_active) {
      return error(HttpStatus.FORBIDDEN, "Account is deactivated");
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return error(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    // Create session
    const expiresAt = getExpiryDate();
    const session = await Session.create({
      user_id: user.id,
      user_type: "user",
      token_hash: "", // placeholder, will update after generating token
      device_info: deviceInfo,
      ip_address: ipAddress,
      is_active: true,
      expires_at: expiresAt,
    });

    const token = generateToken({
      userId: user.id,
      userType: "user",
      sessionId: session.id,
    });

    // Store SHA-256 hash of the token
    await session.update({ token_hash: hashToken(token) });

    return success("Login successful", {
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
  } catch (err: any) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Login failed");
  }
}

export async function logoutUser(req: FastifyRequest) {
  try {
    const session = await Session.findByPk(req.sessionId!);
    if (!session) {
      return error(HttpStatus.NOT_FOUND, "Session not found");
    }

    await session.update({ is_active: false });
    return success("Logged out successfully");
  } catch (err: any) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Logout failed");
  }
}

export async function getUserSessions(req: FastifyRequest) {
  try {
    const sessions = await Session.findAll({
      where: {
        user_id: req.userId!,
        user_type: "user",
        is_active: true,
        expires_at: { [Op.gt]: new Date() },
      },
      attributes: ["id", "device_info", "ip_address", "createdAt", "expires_at"],
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    return success("Sessions fetched", sessions);
  } catch (err: any) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to fetch sessions");
  }
}

export async function revokeSession(req: FastifyRequest) {
  try {
    const { id } = req.params as { id: number };
    const session = await Session.findOne({
      where: { id, user_id: req.userId!, user_type: "user" },
    });

    if (!session) {
      return error(HttpStatus.NOT_FOUND, "Session not found");
    }

    await session.update({ is_active: false });
    return success("Session revoked successfully");
  } catch (err: any) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to revoke session");
  }
}

export async function forgotPassword(req: FastifyRequest) {
  try {
    const { email } = req.body as { email: string };
    const user = await User.findOne({ where: { email }, raw: true });

    // Always return success to prevent email enumeration
    if (!user) {
      return error(HttpStatus.BAD_REQUEST, "email does not registered");
    }

    // Invalidate any existing unused tokens for this user
    await PasswordResetToken.update(
      { used: true },
      { where: { user_id: user.id, user_type: "user", used: false } }
    );

    // Generate token
    const { raw, hash } = generateResetToken();

    await PasswordResetToken.create({
      user_id: user.id,
      user_type: "user",
      token_hash: hash,
      expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      used: false,
    });

    const resetLink = `${config.cors.frontendUrl}/reset-password?token=${raw}`;
    console.log(resetLink, 'reset');
    try {
      await sendPasswordResetEmail(user.email, user.full_name, resetLink);
    } catch (emailErr) {
      console.error("Failed to send password reset email:", emailErr);
    }

    return success("reset link has been sent");
  } catch (err: any) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Forgot password failed");
  }
}

export async function resetPassword(req: FastifyRequest) {
  try {
    const { token, password } = req.body as { token: string; password: string };
    const tokenHash = hashResetToken(token);

    const resetToken = await PasswordResetToken.findOne({
      where: {
        token_hash: tokenHash,
        user_type: "user",
        used: false,
        expires_at: { [Op.gt]: new Date() },
      },
      raw: true
    });

    if (!resetToken) {
      return error(HttpStatus.BAD_REQUEST, "Invalid or expired reset token");
    }

    const user = await User.findOne({ where: { id: resetToken.user_id }, raw: true });
    if (!user) {
      return error(HttpStatus.NOT_FOUND, "User not found");
    }

    const hash = await hashPassword(password);
    const encryptedPlain = encryptAES(password);
    await User.update({ password_hash: hash, password_plain: encryptedPlain }, { where: { id: user.id } });

    // Mark token as used
    await PasswordResetToken.update({ used: true }, { where: { id: resetToken.id } });

    // Revoke all active sessions
    await Session.update(
      { is_active: false },
      { where: { user_id: user.id, user_type: "user", is_active: true } }
    );

    return success("Password reset successfully");
  } catch (err: any) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Password reset failed");
  }
}

export async function signupRequestOtp(req: FastifyRequest) {
  try {
    const { full_name, username, email, mobile_number, password } = req.body as {
      full_name: string; username: string; email: string; mobile_number: string; password: string;
    };

    const existing = await User.findOne({ where: { email }, raw: true });
    if (existing) return error(HttpStatus.CONFLICT, "Email is already registered");

    const existingUsername = await User.findOne({ where: { username }, raw: true });
    if (existingUsername) return error(HttpStatus.CONFLICT, "Username is already taken");

    const existingMobile = await User.findOne({ where: { mobile_number }, raw: true });
    if (existingMobile) return error(HttpStatus.CONFLICT, "Mobile number is already registered");

    const otp = generateOtp();
    const now = new Date();
    const expires_at = new Date(now.getTime() + OTP_TTL_MS);

    const password_hash = await hashPassword(password);
    const password_plain = encryptAES(password);

    const existingOtp = await SignupOtp.findOne({ where: { email } });
    if (existingOtp) {
      await existingOtp.update({
        full_name, username, mobile_number, password_hash, password_plain,
        otp, expires_at, last_sent_at: now, attempts: 0,
      });
    } else {
      await SignupOtp.create({
        email, full_name, username, mobile_number, password_hash, password_plain,
        otp, expires_at, last_sent_at: now, attempts: 0,
      });
    }

    try {
      await sendSignupOtpEmail(email, full_name, otp);
    } catch (emailErr) {
      console.error("Failed to send signup OTP email:", emailErr);
      return error(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send verification email");
    }

    return success("Verification code sent to your email", { email, expires_in: OTP_TTL_MS / 1000 });
  } catch (err: any) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Signup failed");
  }
}

export async function signupResendOtp(req: FastifyRequest) {
  try {
    const { email } = req.body as { email: string };
    const pending = await SignupOtp.findOne({ where: { email } });
    if (!pending) return error(HttpStatus.NOT_FOUND, "No pending signup found for this email");

    const now = Date.now();
    const since = now - new Date(pending.last_sent_at).getTime();
    if (since < OTP_RESEND_COOLDOWN_MS) {
      const retry_after = Math.ceil((OTP_RESEND_COOLDOWN_MS - since) / 1000);
      return error(HttpStatus.TOO_MANY_REQUESTS, `Please wait ${retry_after}s before requesting a new code`);
    }

    const otp = generateOtp();
    await pending.update({
      otp,
      expires_at: new Date(now + OTP_TTL_MS),
      last_sent_at: new Date(now),
      attempts: 0,
    });

    try {
      await sendSignupOtpEmail(email, pending.full_name, otp);
    } catch (emailErr) {
      console.error("Failed to resend signup OTP email:", emailErr);
      return error(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send verification email");
    }

    return success("Verification code resent", { email, expires_in: OTP_TTL_MS / 1000 });
  } catch (err: any) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Resend failed");
  }
}

export async function signupVerifyOtp(req: FastifyRequest) {
  try {
    const { email, otp } = req.body as { email: string; otp: string };
    const pending = await SignupOtp.findOne({ where: { email }, raw: true });
    if (!pending) return error(HttpStatus.NOT_FOUND, "No pending signup found for this email");

    if (new Date(pending.expires_at).getTime() < Date.now()) {
      return error(HttpStatus.BAD_REQUEST, "Verification code has expired");
    }

    if (pending.attempts >= OTP_MAX_ATTEMPTS) {
      return error(HttpStatus.TOO_MANY_REQUESTS, "Too many failed attempts. Please request a new code.");
    }

    console.log(otp, pending.otp);

    if (otp != pending.otp) {
      await pending.update({ attempts: pending.attempts + 1 });
      return error(HttpStatus.BAD_REQUEST, "Invalid verification code");
    }

    const dupe = await User.findOne({ where: { email }, raw: true });
    if (dupe) {
      await SignupOtp.destroy({ where: { id: pending?.id } });
      return error(HttpStatus.CONFLICT, "Email is already registered");
    }

    const user_created = await User.create({
      full_name: pending.full_name,
      username: pending.username,
      email: pending.email,
      mobile_number: pending.mobile_number,
      password_hash: pending.password_hash,
      password_plain: pending.password_plain,
      is_active: true,
    });

    const user: any = await User.findOne({ where: { id: user_created.id }, raw: true });
    await SignupOtp.destroy({ where: { id: pending?.id } });

    // Send notification to admins
    sendRegistrationNotificationEmail({
      fullName: user.full_name,
      email: user.email,
      username: user.username,
      mobileNumber: user.mobile_number,
    }).catch(err => console.error("Failed to send admin registration notification:", err));

    const deviceInfo = req.headers["user-agent"] || null;

    const ipAddress = req.clientInfo?.ipv4 || req.clientInfo?.ip || null;
    const expiresAt = getExpiryDate();
    const session = await Session.create({
      user_id: user.id,
      user_type: "user",
      token_hash: "",
      device_info: deviceInfo,
      ip_address: ipAddress,
      is_active: true,
      expires_at: expiresAt,
    });

    const token = generateToken({ userId: user.id, userType: "user", sessionId: session.id });
    await session.update({ token_hash: hashToken(token) });

    return success("Account verified successfully", {
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
  } catch (err: any) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Verification failed");
  }
}

export async function changePassword(req: FastifyRequest) {
  try {
    const { current_password, new_password } = req.body as { current_password: string; new_password: string };
    const user = await User.findByPk(req.userId!, { raw: true });
    if (!user) {
      return error(HttpStatus.NOT_FOUND, "User not found");
    }

    const valid = await verifyPassword(current_password, user.password_hash);
    if (!valid) {
      return error(HttpStatus.BAD_REQUEST, "Current password is incorrect");
    }

    const hash = await hashPassword(new_password);
    const encryptedPlain = encryptAES(new_password);
    await User.update({ password_hash: hash, password_plain: encryptedPlain }, { where: { id: req.userId! } });

    return success("Password changed successfully");
  } catch (err: any) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Change password failed");
  }
}
