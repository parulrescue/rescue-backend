import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { UpdateProfileSchema, UserSearchQuerySchema, UserLookupQuerySchema } from "./dto";
import { getProfile, updateProfile, updateAvatar, searchUsers, lookupUsers } from "./service";
import { validate } from "../../shared/http/validate";
import { HttpStatus } from "../../shared/http/status";
import { serverError } from "../../shared/http/response";
import { authenticate } from "../../plugins/auth.plugin";

const me = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const result = await getProfile(req);
    res.status(result?.success?.code || result?.error?.code).send(result);
  } catch (error) {
    console.log("Error:- ", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(await serverError(error));
  }
};

const updateMe = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const result = await updateProfile(req);
    res.status(result?.success?.code || result?.error?.code).send(result);
  } catch (error) {
    console.log("Error:- ", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(await serverError(error));
  }
};

const uploadAvatar = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const result = await updateAvatar(req);
    res.status(result?.success?.code || result?.error?.code).send(result);
  } catch (error) {
    console.log("Error:- ", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(await serverError(error));
  }
};

const search = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const result = await searchUsers(req);
    res.status(result?.success?.code || result?.error?.code).send(result);
  } catch (error) {
    console.log("Error:- ", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(await serverError(error));
  }
};

const lookup = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const result = await lookupUsers(req);
    res.status(result?.success?.code || result?.error?.code).send(result);
  } catch (error) {
    console.log("Error:- ", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(await serverError(error));
  }
};

export const userRoutes: FastifyPluginAsync = async (app) => {
  app.get("/me", { preHandler: authenticate }, me);
  app.put("/me", { preHandler: [authenticate, validate(UpdateProfileSchema)] }, updateMe);
  app.post("/me/avatar", { preHandler: authenticate }, uploadAvatar);
  app.get("/search", { preHandler: [authenticate, validate(UserSearchQuerySchema, "query")] }, search);
  app.get("/lookup", { preHandler: [authenticate, validate(UserLookupQuerySchema, "query")] }, lookup);
};
