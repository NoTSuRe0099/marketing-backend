"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostValidation = exports.createPostValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createPostValidation = joi_1.default.object({
    title: joi_1.default.string().min(3).max(100).required(),
    description: joi_1.default.string()
});
exports.updatePostValidation = joi_1.default.object({
    title: joi_1.default.string().min(3).max(100).required(),
    description: joi_1.default.string()
});
