"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const followerSchema = new mongoose_1.default.Schema({
    userId: {
        required: [true, 'userID is required*'],
        unique: true,
        ref: 'User',
        type: mongoose_1.default.Types.ObjectId,
    },
    followers: { required: false, type: [mongoose_1.default.Types.ObjectId] },
    following: { required: false, type: [mongoose_1.default.Types.ObjectId] },
});
exports.default = mongoose_1.default.model('follower', followerSchema);
