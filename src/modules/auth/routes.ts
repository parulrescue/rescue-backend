import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import {
  LoginBodySchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
  SessionIdParamSchema,
} from "./dto";
import {
  loginUser,
  logoutUser,
  getUserSessions,
  revokeSession,
  forgotPassword,
  resetPassword,
  changePassword,
} from "./service";
import { validate } from "../../shared/http/validate";
import { HttpStatus } from "../../shared/http/status";
import { serverError } from "../../shared/http/response";
import { authenticate } from "../../plugins/auth.plugin";

const login = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const result = await loginUser(req);
    res.status(result?.success?.code || result?.error?.code).send(result);
  } catch (error) {
    console.log("Error:- ", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(await serverError(error));
  }
};

const logout = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const result = await logoutUser(req);
    res.status(result?.success?.code || result?.error?.code).send(result);
  } catch (error) {
    console.log("Error:- ", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(await serverError(error));
  }
};

const sessions = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const result = await getUserSessions(req);
    res.status(result?.success?.code || result?.error?.code).send(result);
  } catch (error) {
    console.log("Error:- ", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(await serverError(error));
  }
};

const revokeSessionHandler = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const result = await revokeSession(req);
    res.status(result?.success?.code || result?.error?.code).send(result);
  } catch (error) {
    console.log("Error:- ", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(await serverError(error));
  }
};

const forgotPasswordHandler = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const result = await forgotPassword(req);
    res.status(result?.success?.code || result?.error?.code).send(result);
  } catch (error) {
    console.log("Error:- ", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(await serverError(error));
  }
};

const resetPasswordHandler = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const result = await resetPassword(req);
    res.status(result?.success?.code || result?.error?.code).send(result);
  } catch (error) {
    console.log("Error:- ", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(await serverError(error));
  }
};

const changePasswordHandler = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const result = await changePassword(req);
    res.status(result?.success?.code || result?.error?.code).send(result);
  } catch (error) {
    console.log("Error:- ", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(await serverError(error));
  }
};

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/login", { preHandler: validate(LoginBodySchema) }, login);
  app.post("/logout", { preHandler: authenticate }, logout);
  app.get("/sessions", { preHandler: authenticate }, sessions);
  app.delete("/sessions/:id", { preHandler: [authenticate, validate(SessionIdParamSchema, "params")] }, revokeSessionHandler);
  app.post("/forgot-password", { preHandler: validate(ForgotPasswordSchema) }, forgotPasswordHandler);
  app.post("/reset-password", { preHandler: validate(ResetPasswordSchema) }, resetPasswordHandler);
  app.post("/change-password", { preHandler: [authenticate, validate(ChangePasswordSchema)] }, changePasswordHandler);
};
