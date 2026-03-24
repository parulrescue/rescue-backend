import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { listActiveToAddresses } from "./service";
import { HttpStatus } from "../../shared/http/status";
import { serverError } from "../../shared/http/response";
import { authenticate } from "../../plugins/auth.plugin";

const list = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const result = await listActiveToAddresses();
    res.status(result?.success?.code || result?.error?.code || HttpStatus.OK).send(result);
  } catch (error) {
    console.log("Error:- ", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(serverError(error));
  }
};

export const toAddressRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", { preHandler: [authenticate] }, list);
};
