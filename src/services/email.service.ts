import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { config } from "../config";
import { passwordResetMail, welcomeMail, accountUpdatedMail, signupOtpMail, newUserRegistrationAdminMail } from "./email.templates";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }
  return transporter;
}

export async function sendMail(to_email: string, subject: string, html: string): Promise<void> {
  await getTransporter().sendMail({
    from: config.smtp.from,
    to: to_email,
    subject,
    html,
  });
}

export async function sendPasswordResetEmail(to: string, fullName: string, resetLink: string): Promise<void> {
  const mail = passwordResetMail({ fullName, email: to, resetLink });
  await sendMail(to, mail.subject, mail.html);
}

export async function sendSignupOtpEmail(to: string, fullName: string, otp: string): Promise<void> {
  const mail = signupOtpMail({ fullName, email: to, otp });
  await sendMail(to, mail.subject, mail.html);
}

export async function sendWelcomeEmail(to: string, fullName: string, username: string, password: string, loginLink: string): Promise<void> {
  const mail = welcomeMail({ fullName, email: to, username, password, loginLink });
  await sendMail(to, mail.subject, mail.html);
}

export async function sendAccountUpdatedEmail(to: string, fullName: string, changes: string[], newPassword: string | undefined, loginLink: string): Promise<void> {
  const data: Parameters<typeof accountUpdatedMail>[0] = { fullName, email: to, changes, loginLink };
  if (newPassword !== undefined) data.newPassword = newPassword;
  const mail = accountUpdatedMail(data);
  await sendMail(to, mail.subject, mail.html);
}

export async function sendRegistrationNotificationEmail(data: { fullName: string; email: string; username: string; mobileNumber: string }): Promise<void> {
  const mail = newUserRegistrationAdminMail(data);
  const adminEmails = ["resue@parulgauseva.com", "parul.rescue@gmail.com"];
  
  for (const to of adminEmails) {
    try {
      await sendMail(to, mail.subject, mail.html);
    } catch (err) {
      console.error(`Failed to send registration notification to ${to}:`, err);
    }
  }
}