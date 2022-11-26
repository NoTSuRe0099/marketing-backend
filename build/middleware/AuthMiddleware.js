"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.isAuthenticatedUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_schema_1 = __importDefault(require("../model/user.schema"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const errorMiddleware_1 = require("./errorMiddleware");
exports.isAuthenticatedUser = (0, errorMiddleware_1.asyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.cookies;
    if (!token && typeof token !== 'string') {
        return next(new errorHandler_1.default('Unauthorized please login', 401));
    }
    const decodedData = jsonwebtoken_1.default.verify(token, String(process.env.JWT_SECRET));
    // @ts-ignore
    req.user = yield user_schema_1.default.findById(decodedData.id);
    return next();
}));
const authorizeRoles = (...roles) => (req, res, next) => {
    // @ts-ignore
    if (!roles.includes(req.user.role)) {
        return next(new errorHandler_1.default(
        // @ts-ignore
        `Role: ${req.user.role} is not allowed to access this resouce `, 403));
    }
    return next();
};
exports.authorizeRoles = authorizeRoles;
