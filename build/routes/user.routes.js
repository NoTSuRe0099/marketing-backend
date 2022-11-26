"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const router = express_1.default.Router();
router.route('/followUser/:id').get(AuthMiddleware_1.isAuthenticatedUser, user_controller_1.followUser);
router.route('/unfollowUser/:id').get(AuthMiddleware_1.isAuthenticatedUser, user_controller_1.unFollowUser);
router.route('/getAllusers').get(AuthMiddleware_1.isAuthenticatedUser, user_controller_1.getAllusers);
router.get('/getFollowersAndFollowingUsers', AuthMiddleware_1.isAuthenticatedUser, user_controller_1.getFollowingUsers);
exports.default = router;
