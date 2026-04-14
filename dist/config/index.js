"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const loadConfig_1 = require("./loadConfig");
let cachedConfig = null;
exports.config = (() => {
    if (!cachedConfig) {
        cachedConfig = (0, loadConfig_1.loadConfig)();
    }
    return cachedConfig;
})();
