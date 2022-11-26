"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    role: {
        type: String,
        required: [true, 'Role is Required*'],
        default: 'user',
        enum: ['admin', 'user'],
    },
    username: {
        type: String,
        required: [true, 'Username is Required*'],
        minlength: [4, 'Username must be at least 4 characters long'],
    },
    email: {
        type: String,
        required: [true, 'Email is Required*'],
        unique: [true, 'Email Already Exists'],
    },
    password: {
        type: String,
        required: [true, 'Password is Required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false,
    },
    avatar: {
        type: String,
        required: false,
    },
});
exports.default = mongoose_1.default.model('User', userSchema);
