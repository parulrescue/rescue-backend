"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetMail = passwordResetMail;
exports.accountUpdatedMail = accountUpdatedMail;
exports.welcomeMail = welcomeMail;
function passwordResetMail(data) {
    return {
        subject: "Reset your password",
        html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p>Hi ${data.fullName},</p>
      <p>We received a request to reset the password for <strong>${data.email}</strong>.</p>
      <p>Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.resetLink}"
           style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
          Reset Password
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">This link expires in <strong>5 minutes</strong>.</p>
      <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">Animal Rescue Management System</p>
    </div>`,
    };
}
function accountUpdatedMail(data) {
    const changesList = data.changes.map((c) => `<li style="margin: 4px 0;">${c}</li>`).join("");
    return {
        subject: "Your Account Details Have Been Updated",
        html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Account Updated</h2>
      <p>Hi ${data.fullName},</p>
      <p>Your account (<strong>${data.email}</strong>) has been updated by an administrator. Here's what changed:</p>
      <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fde68a;">
        <ul style="margin: 0; padding-left: 20px; color: #92400e;">
          ${changesList}
        </ul>
      </div>${data.newPassword ? `
      <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
        <p style="margin: 5px 0; color: #991b1b;"><strong>New Password:</strong> ${data.newPassword}</p>
        <p style="margin: 5px 0; color: #991b1b; font-size: 13px;">Please login with your new password and change it if needed.</p>
      </div>` : ""}
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.loginLink}"
           style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
          Login Now
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">If you did not expect this change, please contact the administrator.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">Animal Rescue Management System</p>
    </div>`,
    };
}
function welcomeMail(data) {
    return {
        subject: "Welcome to Animal Rescue — Your Login Credentials",
        html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Welcome to Animal Rescue!</h2>
      <p>Hi ${data.fullName},</p>
      <p>Your account has been created for <strong>${data.email}</strong>. Here are your login credentials:</p>
      <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0;">
        <p style="margin: 5px 0;"><strong>Username:</strong> ${data.username}</p>
        <p style="margin: 5px 0;"><strong>Password:</strong> ${data.password}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.loginLink}"
           style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
          Login Now
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">Please change your password after your first login.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">Animal Rescue Management System</p>
    </div>`,
    };
}
