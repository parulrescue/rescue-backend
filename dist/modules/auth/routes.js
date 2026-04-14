"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const dto_1 = require("./dto");
const service_1 = require("./service");
const validate_1 = require("../../shared/http/validate");
const status_1 = require("../../shared/http/status");
const response_1 = require("../../shared/http/response");
const auth_plugin_1 = require("../../plugins/auth.plugin");
const login = async (req, res) => {
    try {
        const result = await (0, service_1.loginUser)(req);
        res.status(result?.success?.code || result?.error?.code).send(result);
    }
    catch (error) {
        console.log("Error:- ", error);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send(await (0, response_1.serverError)(error));
    }
};
const logout = async (req, res) => {
    try {
        const result = await (0, service_1.logoutUser)(req);
        res.status(result?.success?.code || result?.error?.code).send(result);
    }
    catch (error) {
        console.log("Error:- ", error);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send(await (0, response_1.serverError)(error));
    }
};
const sessions = async (req, res) => {
    try {
        const result = await (0, service_1.getUserSessions)(req);
        res.status(result?.success?.code || result?.error?.code).send(result);
    }
    catch (error) {
        console.log("Error:- ", error);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send(await (0, response_1.serverError)(error));
    }
};
const revokeSessionHandler = async (req, res) => {
    try {
        const result = await (0, service_1.revokeSession)(req);
        res.status(result?.success?.code || result?.error?.code).send(result);
    }
    catch (error) {
        console.log("Error:- ", error);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send(await (0, response_1.serverError)(error));
    }
};
const forgotPasswordHandler = async (req, res) => {
    try {
        const result = await (0, service_1.forgotPassword)(req);
        res.status(result?.success?.code || result?.error?.code).send(result);
    }
    catch (error) {
        console.log("Error:- ", error);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send(await (0, response_1.serverError)(error));
    }
};
const resetPasswordHandler = async (req, res) => {
    try {
        const result = await (0, service_1.resetPassword)(req);
        res.status(result?.success?.code || result?.error?.code).send(result);
    }
    catch (error) {
        console.log("Error:- ", error);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send(await (0, response_1.serverError)(error));
    }
};
const changePasswordHandler = async (req, res) => {
    try {
        const result = await (0, service_1.changePassword)(req);
        res.status(result?.success?.code || result?.error?.code).send(result);
    }
    catch (error) {
        console.log("Error:- ", error);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send(await (0, response_1.serverError)(error));
    }
};
const authRoutes = async (app) => {
    app.post("/login", { preHandler: (0, validate_1.validate)(dto_1.LoginBodySchema) }, login);
    app.post("/logout", { preHandler: auth_plugin_1.authenticate }, logout);
    app.get("/sessions", { preHandler: auth_plugin_1.authenticate }, sessions);
    app.delete("/sessions/:id", { preHandler: [auth_plugin_1.authenticate, (0, validate_1.validate)(dto_1.SessionIdParamSchema, "params")] }, revokeSessionHandler);
    app.post("/forgot-password", { preHandler: (0, validate_1.validate)(dto_1.ForgotPasswordSchema) }, forgotPasswordHandler);
    app.post("/reset-password", { preHandler: (0, validate_1.validate)(dto_1.ResetPasswordSchema) }, resetPasswordHandler);
    app.post("/change-password", { preHandler: [auth_plugin_1.authenticate, (0, validate_1.validate)(dto_1.ChangePasswordSchema)] }, changePasswordHandler);
};
exports.authRoutes = authRoutes;
