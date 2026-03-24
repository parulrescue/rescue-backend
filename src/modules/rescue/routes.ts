import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { RescueListQuerySchema, RescueIdParamSchema } from "./dto";
import { createRescue, listRescues, getRescueDetail } from "./service";
import { validate } from "../../shared/http/validate";
import { HttpStatus } from "../../shared/http/status";
import { serverError } from "../../shared/http/response";
import { authenticate } from "../../plugins/auth.plugin";

const list = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const result = await listRescues(req);
    res.status(result?.success?.code || result?.error?.code).send(result);
  } catch (error) {
    console.log("Error:- ", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(await serverError(error));
  }
};

const detail = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const result = await getRescueDetail(req);
    res.status(result?.success?.code || result?.error?.code).send(result);
  } catch (error) {
    console.log("Error:- ", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(await serverError(error));
  }
};

const create = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const result = await createRescue(req);
    res.status(result?.success?.code || result?.error?.code).send(result);
  } catch (error) {
    console.log("Error:- ", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(await serverError(error));
  }
};

export const rescueRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", { preHandler: [authenticate, validate(RescueListQuerySchema, "query")] }, list);
  app.get("/:id", { preHandler: [authenticate, validate(RescueIdParamSchema, "params")] }, detail);
  app.post("/", { preHandler: authenticate }, create);
};
