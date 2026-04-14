"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rescueRoutes = void 0;
const dto_1 = require("./dto");
const service_1 = require("./service");
const validate_1 = require("../../shared/http/validate");
const status_1 = require("../../shared/http/status");
const response_1 = require("../../shared/http/response");
const auth_plugin_1 = require("../../plugins/auth.plugin");
const list = async (req, res) => {
    try {
        const result = await (0, service_1.listRescues)(req);
        res.status(result?.success?.code || result?.error?.code).send(result);
    }
    catch (error) {
        console.log("Error:- ", error);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send(await (0, response_1.serverError)(error));
    }
};
const detail = async (req, res) => {
    try {
        const result = await (0, service_1.getRescueDetail)(req);
        res.status(result?.success?.code || result?.error?.code).send(result);
    }
    catch (error) {
        console.log("Error:- ", error);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send(await (0, response_1.serverError)(error));
    }
};
const create = async (req, res) => {
    try {
        const result = await (0, service_1.createRescue)(req);
        res.status(result?.success?.code || result?.error?.code).send(result);
    }
    catch (error) {
        console.log("Error:- ", error);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send(await (0, response_1.serverError)(error));
    }
};
const rescueRoutes = async (app) => {
    app.get("/", { preHandler: [auth_plugin_1.authenticate, (0, validate_1.validate)(dto_1.RescueListQuerySchema, "query")] }, list);
    app.get("/:id", { preHandler: [auth_plugin_1.authenticate, (0, validate_1.validate)(dto_1.RescueIdParamSchema, "params")] }, detail);
    app.post("/", { preHandler: auth_plugin_1.authenticate }, create);
};
exports.rescueRoutes = rescueRoutes;
