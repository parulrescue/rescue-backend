"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logExportRoutes = void 0;
const dto_1 = require("./dto");
const service_1 = require("./service");
const validate_1 = require("../../shared/http/validate");
const status_1 = require("../../shared/http/status");
const response_1 = require("../../shared/http/response");
const getExportHistoryHandler = async (req, res) => {
    try {
        const result = await (0, service_1.getExportHistory)(req);
        res.status(result?.success?.code || result?.error?.code || status_1.HttpStatus.OK).send(result);
    }
    catch (err) {
        console.error("Get export history error:", err);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send((0, response_1.serverError)(err));
    }
};
const getAvailableDatesHandler = async (req, res) => {
    try {
        const result = await (0, service_1.getAvailableDates)(req);
        res.status(result?.success?.code || result?.error?.code || status_1.HttpStatus.OK).send(result);
    }
    catch (err) {
        console.error("Get available dates error:", err);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send((0, response_1.serverError)(err));
    }
};
const getAvailableEnvironmentsHandler = async (_req, res) => {
    try {
        const result = await (0, service_1.getAvailableEnvironments)();
        res.status(result?.success?.code || result?.error?.code || status_1.HttpStatus.OK).send(result);
    }
    catch (err) {
        console.error("Get available environments error:", err);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send((0, response_1.serverError)(err));
    }
};
const filterLogsHandler = async (req, res) => {
    try {
        const result = await (0, service_1.filterLogs)(req);
        res.status(result?.success?.code || result?.error?.code || status_1.HttpStatus.OK).send(result);
    }
    catch (err) {
        console.error("Filter logs error:", err);
        res.status(status_1.HttpStatus.INTERNAL_SERVER_ERROR).send((0, response_1.serverError)(err));
    }
};
const logExportRoutes = async (app) => {
    // Get export history from database
    app.get("/history", { preHandler: (0, validate_1.validate)({ query: dto_1.GetExportHistoryQuerySchema }) }, getExportHistoryHandler);
    // Get available log dates
    app.get("/dates", { preHandler: (0, validate_1.validate)({ query: dto_1.GetAvailableDatesQuerySchema }) }, getAvailableDatesHandler);
    // Get available environments
    app.get("/environments", getAvailableEnvironmentsHandler);
    // Filter logs by date and level, return JSON
    app.get("/filter", { preHandler: (0, validate_1.validate)({ query: dto_1.FilterLogsQuerySchema }) }, filterLogsHandler);
};
exports.logExportRoutes = logExportRoutes;
