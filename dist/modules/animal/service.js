"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnimals = getAnimals;
const animal_model_1 = require("../../db/models/rescue/animal.model");
const response_1 = require("../../shared/http/response");
const status_1 = require("../../shared/http/status");
async function getAnimals(req) {
    try {
        const animals = await animal_model_1.Animal.findAll({
            where: { is_active: true },
            attributes: ["id", "name"],
            order: [["name", "ASC"]],
            raw: true,
        });
        return (0, response_1.success)("Animals fetched", animals);
    }
    catch (err) {
        return (0, response_1.error)(status_1.HttpStatus.INTERNAL_SERVER_ERROR, err.message || "Failed to fetch animals");
    }
}
