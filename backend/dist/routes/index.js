"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stellarRoutes = exports.passkeyRoutes = void 0;
const passkey_routes_1 = __importDefault(require("./passkey.routes"));
exports.passkeyRoutes = passkey_routes_1.default;
const stellar_routes_1 = __importDefault(require("./stellar.routes"));
exports.stellarRoutes = stellar_routes_1.default;
