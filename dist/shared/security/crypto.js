"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResetToken = generateResetToken;
exports.hashResetToken = hashResetToken;
exports.encryptAES = encryptAES;
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../../config");
function generateResetToken() {
    const raw = crypto_1.default.randomUUID();
    const hash = crypto_1.default.createHash("sha256").update(raw).digest("hex");
    return { raw, hash };
}
function hashResetToken(raw) {
    return crypto_1.default.createHash("sha256").update(raw).digest("hex");
}
const AES_ALGORITHM = "aes-256-cbc";
function encryptAES(plainText) {
    const key = Buffer.from(config_1.config.security.aesSecretKey, "utf8").subarray(0, 32);
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv(AES_ALGORITHM, key, iv);
    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
}
