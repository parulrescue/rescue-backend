import "fastify";
import type { Sequelize } from "sequelize-typescript";

declare module "fastify" {
  interface FastifyInstance {
    db: Sequelize;
  }

  interface FastifyRequest {
    requestId: string;
    userId?: number;
    sessionId?: number;
  }

  interface FastifyReply {
    responseData?: unknown;
  }
}

export {};
