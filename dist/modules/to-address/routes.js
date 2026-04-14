"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAddressRoutes = void 0;
const service_1 = require("./service");
const status_1 = require("../../shared/http/status");
const response_1 = require("../../shared/http/response");
const auth_plugin_1 = require("../../plugins/auth.plugin");
const list = async (req, res) => {
    try {
        const result = await (0, service_1.listActiveToAddresses)();
        res.status(result?.success?.code || result?.error?.code || status_1.HttpStatus.OK).send(result);
    }
    catch (error) {
        console.log("Error:- ", error);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send((0, response_1.serverError)(error));
    }
};
const toAddressRoutes = async (app) => {
    app.get("/", { preHandler: [auth_plugin_1.authenticate] }, list);
};
exports.toAddressRoutes = toAddressRoutes;
