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
const mongoose_1 = __importDefault(require("mongoose"));
const errorMiddleware_1 = require("../middleware/errorMiddleware");
const follower_schema_1 = __importDefault(require("../model/follower.schema"));
const post_schema_1 = __importDefault(require("../model/post.schema"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const post_validator_1 = require("../validators/post.validator");
const postController = {
    createPost: (0, errorMiddleware_1.asyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield post_validator_1.createPostValidation.validateAsync(req === null || req === void 0 ? void 0 : req.body);
        // @ts-ignore
        yield (post_schema_1.default === null || post_schema_1.default === void 0 ? void 0 : post_schema_1.default.create(Object.assign(Object.assign({}, data), { userId: req.user.id })).catch((err) => {
            console.log('err', err);
            return next(new errorHandler_1.default('something went wront', 400));
        }));
        return res.status(201).json({
            success: true,
            message: 'New post created'
        });
    })),
    getPosts: (0, errorMiddleware_1.asyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const page = Number((_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.page) || Number(1);
        const limit = Number((_b = req === null || req === void 0 ? void 0 : req.query) === null || _b === void 0 ? void 0 : _b.limit) || Number(10);
        const skip = (page - 1) * limit;
        const posts = yield (follower_schema_1.default === null || follower_schema_1.default === void 0 ? void 0 : follower_schema_1.default.aggregate([
            {
                // @ts-ignore
                $match: { userId: mongoose_1.default.Types.ObjectId(req.user._id) },
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    followers: 1,
                    following: {
                        // @ts-ignore
                        $concatArrays: ['$following', [mongoose_1.default.Types.ObjectId(req.user._id)]]
                    }
                }
            },
            {
                $unwind: {
                    path: '$following'
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: 'following',
                    foreignField: 'userId',
                    as: 'thePost',
                },
            },
            {
                $unwind: {
                    path: '$thePost'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'thePost.userId',
                    foreignField: '_id',
                    as: 'thePost.userInfo',
                },
            },
            {
                $unset: [
                    'thePost.userInfo.password',
                    'thePost.userInfo.__v',
                    'thePost.userInfo._id',
                    'thePost.userInfo.role'
                ],
            },
            { $replaceRoot: { newRoot: '$thePost' } },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    userId: 1,
                    description: 1,
                    createdAt: 1,
                    userInfo: { $arrayElemAt: ['$userInfo', 0] }
                }
            }
            //! not required --->
            // {
            //   $addFields: {
            //     thePost: {
            //       $reduce: {
            //         input: '$thePost',
            //         initialValue: [],
            //         in: { $concatArrays: ['$$value', '$$this'] }
            //       }
            //     },
            //   }
            // }
        ]).skip(skip).limit(limit).sort({ createdAt: -1 }).catch((err) => {
            console.log('err', err);
            return next(new errorHandler_1.default('something went wront', 400));
        }));
        // console.log('posts', posts);
        return res.status(200).json({
            success: true,
            data: posts
        });
    }))
};
exports.default = postController;
