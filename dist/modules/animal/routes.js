"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.animalRoutes = void 0;
const service_1 = require("./service");
const status_1 = require("../../shared/http/status");
const response_1 = require("../../shared/http/response");
const list = async (req, res) => {
    try {
        const result = await (0, service_1.getAnimals)(req);
        res.status(result?.success?.code || result?.error?.code).send(result);
    }
    catch (error) {
        console.log("Error:- ", error);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send(await (0, response_1.serverError)(error));
    }
};
const animalRoutes = async (app) => {
    app.get("/", list);
};
exports.animalRoutes = animalRoutes;
