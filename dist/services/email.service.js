"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = sendMail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendAccountUpdatedEmail = sendAccountUpdatedEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config");
const email_templates_1 = require("./email.templates");
let transporter = null;
function getTransporter() {
    if (!transporter) {
        transporter = nodemailer_1.default.createTransport({
            host: config_1.config.smtp.host,
            port: config_1.config.smtp.port,
            secure: config_1.config.smtp.port === 465,
            auth: {
                user: config_1.config.smtp.user,
                pass: config_1.config.smtp.pass,
            },
        });
    }
    return transporter;
}
async function sendMail(to_email, subject, html) {
    await getTransporter().sendMail({
        from: config_1.config.smtp.from,
        to: to_email,
        subject,
        html,
    });
}
async function sendPasswordResetEmail(to, fullName, resetLink) {
    const mail = (0, email_templates_1.passwordResetMail)({ fullName, email: to, resetLink });
    await sendMail(to, mail.subject, mail.html);
}
async function sendWelcomeEmail(to, fullName, username, password, loginLink) {
    const mail = (0, email_templates_1.welcomeMail)({ fullName, email: to, username, password, loginLink });
    await sendMail(to, mail.subject, mail.html);
}
async function sendAccountUpdatedEmail(to, fullName, changes, newPassword, loginLink) {
    const data = { fullName, email: to, changes, loginLink };
    if (newPassword !== undefined)
        data.newPassword = newPassword;
    const mail = (0, email_templates_1.accountUpdatedMail)(data);
    await sendMail(to, mail.subject, mail.html);
}
