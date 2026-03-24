import { FastifyRequest } from "fastify";
import { Op } from "sequelize";
import { User } from "../../db/models/auth/user.model";
import { Session } from "../../db/models/auth/session.model";
import { PasswordResetToken } from "../../db/models/auth/password-reset-token.model";
import { hashPassword, verifyPassword } from "../../shared/security/password";
import { generateToken, hashToken, getExpiryDate } from "../../shared/security/jwt";
import { generateResetToken, hashResetToken, encryptAES } from "../../shared/security/crypto";
import { sendPasswordResetEmail } from "../../services/email.service";
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
      return error(HttpStatus.BAD_REQUEST,"email does not registered");
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
    });

    if (!resetToken) {
      return error(HttpStatus.BAD_REQUEST, "Invalid or expired reset token");
    }

    const user = await User.findByPk(resetToken.user_id);
    if (!user) {
      return error(HttpStatus.NOT_FOUND, "User not found");
    }

    const hash = await hashPassword(password);
    const encryptedPlain = encryptAES(password);
    await user.update({ password_hash: hash, password_plain: encryptedPlain });

    // Mark token as used
    await resetToken.update({ used: true });

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
