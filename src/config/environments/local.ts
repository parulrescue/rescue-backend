import { loadDotEnv } from "../env";
loadDotEnv();

const logDir = `${process.cwd()}/logs`;

const localConfig = {
  app: {
    name: "backend",
    env: "local",
    port: Number(process.env.PORT) || 5555,
    timezone: process.env.TIMEZONE || "Asia/Kolkata", // Indian Standard Time
  },

  database: {
    host: process.env.DATABASE_HOST ?? "",
    port: Number(process.env.DATABASE_PORT ?? ""),
    user: process.env.DATABASE_USER ?? "",
    password: process.env.DATABASE_PASSWORD ?? "",
    name: process.env.DATABASE_NAME ?? "",
    ssl: false,
  },

  logging: {
    captureErrors: false,
    captureSuccess: false,
    dir: logDir,
    exportDir: `${process.cwd()}/exports`,
  },

  security: {
    jwtSecret: process.env.JWT_SECRET || "",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "",
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
    fileAccessUrl: process.env.FILE_ACCESS_URL || "",
  },

  cors: {
    frontendUrl: process.env.FRONTEND_URL || "",
  },
};

export default localConfig;
