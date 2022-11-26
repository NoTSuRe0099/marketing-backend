"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const post_controller_1 = __importDefault(require("../controllers/post.controller"));
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const router = express_1.default.Router();
router.route('/').post(AuthMiddleware_1.isAuthenticatedUser, post_controller_1.default.createPost).get(AuthMiddleware_1.isAuthenticatedUser, post_controller_1.default.getPosts);
exports.default = router;
