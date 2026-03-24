import crypto from "crypto";
import { config } from "../../config";

export function generateResetToken(): { raw: string; hash: string } {
  const raw = crypto.randomUUID();
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

export function hashResetToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

const AES_ALGORITHM = "aes-256-cbc";

export function encryptAES(plainText: string): string {
  const key = Buffer.from(config.security.aesSecretKey, "utf8").subarray(0, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(AES_ALGORITHM, key, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}
