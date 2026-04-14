"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const dto_1 = require("./dto");
const service_1 = require("./service");
const validate_1 = require("../../shared/http/validate");
const status_1 = require("../../shared/http/status");
const response_1 = require("../../shared/http/response");
const auth_plugin_1 = require("../../plugins/auth.plugin");
const me = async (req, res) => {
    try {
        const result = await (0, service_1.getProfile)(req);
        res.status(result?.success?.code || result?.error?.code).send(result);
    }
    catch (error) {
        console.log("Error:- ", error);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send(await (0, response_1.serverError)(error));
    }
};
const updateMe = async (req, res) => {
    try {
        const result = await (0, service_1.updateProfile)(req);
        res.status(result?.success?.code || result?.error?.code).send(result);
    }
    catch (error) {
        console.log("Error:- ", error);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send(await (0, response_1.serverError)(error));
    }
};
const uploadAvatar = async (req, res) => {
    try {
        const result = await (0, service_1.updateAvatar)(req);
        res.status(result?.success?.code || result?.error?.code).send(result);
    }
    catch (error) {
        console.log("Error:- ", error);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send(await (0, response_1.serverError)(error));
    }
};
const search = async (req, res) => {
    try {
        const result = await (0, service_1.searchUsers)(req);
        res.status(result?.success?.code || result?.error?.code).send(result);
    }
    catch (error) {
        console.log("Error:- ", error);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send(await (0, response_1.serverError)(error));
    }
};
const lookup = async (req, res) => {
    try {
        const result = await (0, service_1.lookupUsers)(req);
        res.status(result?.success?.code || result?.error?.code).send(result);
    }
    catch (error) {
        console.log("Error:- ", error);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send(await (0, response_1.serverError)(error));
    }
};
const userRoutes = async (app) => {
    app.get("/me", { preHandler: auth_plugin_1.authenticate }, me);
    app.put("/me", { preHandler: [auth_plugin_1.authenticate, (0, validate_1.validate)(dto_1.UpdateProfileSchema)] }, updateMe);
    app.post("/me/avatar", { preHandler: auth_plugin_1.authenticate }, uploadAvatar);
    app.get("/search", { preHandler: [auth_plugin_1.authenticate, (0, validate_1.validate)(dto_1.UserSearchQuerySchema, "query")] }, search);
    app.get("/lookup", { preHandler: [auth_plugin_1.authenticate, (0, validate_1.validate)(dto_1.UserLookupQuerySchema, "query")] }, lookup);
};
exports.userRoutes = userRoutes;
