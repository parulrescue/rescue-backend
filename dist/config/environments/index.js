"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const local_1 = __importDefault(require("./local"));
const uat_1 = __importDefault(require("./uat"));
const prod_1 = __importDefault(require("./prod"));
const schema_1 = require("../schema");
const env = (process.env.APP_ENV || process.env.NODE_ENV || "local");
const configs = { local: local_1.default, uat: uat_1.default, prod: prod_1.default };
const env_config = schema_1.ConfigSchema.parse(configs[env]);
if (!env_config) {
    throw new Error(`Invalid APP_ENV / NODE_ENV value: ${env}`);
}
exports.default = env_config;
