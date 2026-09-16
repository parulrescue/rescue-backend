import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import path from "path";
import fs from "fs";
import { error } from "../../shared/http/response";
import { HttpStatus } from "../../shared/http/status";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
  ".pdf": "application/pdf",
};

function resolveWithinPublicDir(publicDir: string, requestedPath: string): string | null {
  const decoded = decodeURIComponent(requestedPath || "");
  const fullPath = path.resolve(publicDir, decoded);
  const normalizedPublicDir = path.resolve(publicDir) + path.sep;
  if (!fullPath.startsWith(normalizedPublicDir)) return null;
  return fullPath;
}

/**
 * Manually joins the requested path onto the public directory and streams the
 * raw file back, instead of relying on @fastify/static's own not-found handling.
 */
function serveFile(publicDir: string) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const requestedPath = (req.params as any)["*"] as string;
    const fullPath = resolveWithinPublicDir(publicDir, requestedPath);

    if (!fullPath) {
      reply.header("X-Resolved-Path", path.join(publicDir, requestedPath || ""));
      return reply.status(HttpStatus.BAD_REQUEST).send({
        ...error(HttpStatus.BAD_REQUEST, "Invalid file path"),
        path: path.join(publicDir, requestedPath || ""),
      });
    }

    reply.header("X-Resolved-Path", fullPath);

    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
      return reply.status(HttpStatus.NOT_FOUND).send({
        ...error(HttpStatus.NOT_FOUND, "File not found"),
        path: fullPath,
      });
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const stream = fs.createReadStream(fullPath);

    reply.header("Content-Type", contentType);
    return reply.send(stream);
  };
}

export const fileRoutes: FastifyPluginAsync = async (app) => {
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  // Primary route — DB stores relative paths like "profile_pic/avatar.jpg"
  app.get("/api/file/*", serveFile(publicDir));

  // Legacy route — kept for backward compatibility with rows that still hold "/public/..." values
  app.get("/public/*", serveFile(publicDir));
};
