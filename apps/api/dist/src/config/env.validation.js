"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
function validateEnv(config) {
    const required = ['JWT_SECRET', 'DATABASE_URL'];
    for (const key of required) {
        if (!config[key]) {
            throw new Error(`Missing environment variable: ${key}`);
        }
    }
    return config;
}
//# sourceMappingURL=env.validation.js.map