import { loadDotEnv } from "../env";
loadDotEnv();

const logDir = `${process.cwd()}/logs`;

const uatConfig = {
  app: {
    name: "backend",
    env: "uat",
    port: Number(process.env.PORT) || 5555,
    timezone: process.env.TIMEZONE || "Asia/Kolkata",
  },

  database: {
    host: process.env.LOCAL_DATABASE_HOST || "",
    port: Number(process.env.LOCAL_DATABASE_PORT || "5432"),
    user: process.env.LOCAL_DATABASE_USER || "postgres",
    password: process.env.LOCAL_DATABASE_PASSWORD || "postgres",
    name: process.env.LOCAL_DATABASE_NAME || "",
    ssl: true,
  },

  logging: {
    captureErrors: true,
    captureSuccess: true,
    dir: logDir,
    exportDir: `${process.cwd()}/exports`,
  },

  security: {
    jwtSecret: process.env.JWT_SECRET || "jwt",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "48h",
    bcryptSaltRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
    aesSecretKey: process.env.AES_SECRET_KEY || "",
  },

  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "Animal Rescue <noreply@example.com>",
  },

  upload: {
    dir: process.env.UPLOAD_DIR || "./uploads",
  },

  cors: {
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  },
};

export default uatConfig;
