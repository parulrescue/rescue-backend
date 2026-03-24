import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { getAnimals } from "./service";
import { HttpStatus } from "../../shared/http/status";
import { serverError } from "../../shared/http/response";

const list = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const result = await getAnimals(req);
    res.status(result?.success?.code || result?.error?.code).send(result);
  } catch (error) {
    console.log("Error:- ", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(await serverError(error));
  }
};

export const animalRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", list);
};
