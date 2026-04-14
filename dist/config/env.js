"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadDotEnv = loadDotEnv;
const dotenv_1 = __importDefault(require("dotenv"));
function loadDotEnv() {
    dotenv_1.default.config();
}
