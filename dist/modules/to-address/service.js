"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listActiveToAddresses = listActiveToAddresses;
const to_address_model_1 = require("../../db/models/rescue/to-address.model");
const response_1 = require("../../shared/http/response");
const status_1 = require("../../shared/http/status");
async function listActiveToAddresses() {
    try {
        const rows = await to_address_model_1.ToAddress.findAll({
            where: { is_active: true },
            attributes: ["id", "title", "address", "pincode", "area"],
            order: [["title", "ASC"]],
        });
        return (0, response_1.success)("To addresses fetched", rows);
    }
    catch (err) {
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch to addresses");
    }
}
