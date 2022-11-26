"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const router = express_1.default.Router();
router.route('/register').post(user_controller_1.Register);
router.route('/login').post(user_controller_1.Login);
router.route('/me').get(AuthMiddleware_1.isAuthenticatedUser, user_controller_1.myProfile);
router.route('/logout').get(user_controller_1.Logout);
exports.default = router;
