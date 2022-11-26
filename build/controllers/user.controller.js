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
exports.getFollowingUsers = exports.getAllusers = exports.unFollowUser = exports.followUser = exports.Logout = exports.myProfile = exports.Login = exports.Register = void 0;
/* eslint-disable max-len */
const cloudinary_1 = __importDefault(require("cloudinary"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const errorMiddleware_1 = require("../middleware/errorMiddleware");
const user_schema_1 = __importDefault(require("../model/user.schema"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const Auth_validator_1 = require("../validators/Auth.validator");
const follower_schema_1 = __importDefault(require("../model/follower.schema"));
const cloudinary = cloudinary_1.default.v2;
function generateToken(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = yield jsonwebtoken_1.default.sign({ id: userId }, `${process.env.JWT_SECRET}`);
        return token;
    });
}
function comparePassword(bodyPass, hashPass) {
    return __awaiter(this, void 0, void 0, function* () {
        const isMatch = yield bcrypt_1.default.compare(bodyPass, hashPass);
        return isMatch;
    });
}
//* Register User
exports.Register = (0, errorMiddleware_1.asyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield Auth_validator_1.registerValidation.validateAsync(req === null || req === void 0 ? void 0 : req.body);
    const { username, email, password, } = data;
    // if (!email || !password || !username) {
    //   return next(new ErrorHandler('Please Enter Email, Password & Username', 400));
    // }
    let user = yield user_schema_1.default.findOne({ email });
    if (user) {
        return res
            .status(403)
            .json({ success: false, message: 'Email already registered' });
    }
    // if (!req?.files?.avatar) {
    //   return res.status(400).json({
    //     success: false,
    //     messasge: 'Please provide image in avatar*',
    //   });
    // }
    // let avatar: any = await req?.files?.avatar;
    // await cloudinary.uploader.upload(
    //   avatar.tempFilePath,
    //   {
    //     folder: 'trading/users',
    //   },
    //   (err, result) => {
    //     avatar = result?.secure_url;
    //   },
    // );
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const newUser = new user_schema_1.default({
        username,
        email,
        password: hashedPassword,
        // avatar,
    });
    user = yield user_schema_1.default.create(newUser).then((result) => __awaiter(void 0, void 0, void 0, function* () {
        yield follower_schema_1.default.create({
            userId: result._id,
        });
    }));
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const token = generateToken(user === null || user === void 0 ? void 0 : user._id);
    const options = {
        expires: new Date(Date.now() + 48 * 60 * 60 * 1000),
        httpOnly: true,
    };
    return res.status(201).cookie('token', token, options).json({
        success: true,
        message: 'Registered successfully ✅',
    });
}));
//* Login User
exports.Login = (0, errorMiddleware_1.asyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield user_schema_1.default.findOne({ email }).select('+password');
    if (!user) {
        return res.status(403).json({
            success: false,
            message: 'Email not found',
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const isMatch = yield comparePassword(password, user === null || user === void 0 ? void 0 : user.password);
    if (!isMatch) {
        return res.status(403).json({
            success: false,
            message: 'Password is incorrect',
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const token = yield generateToken(`${user === null || user === void 0 ? void 0 : user._id}`);
    const options = {
        expires: new Date(Date.now() + 48 * 60 * 60 * 1000),
        httpOnly: true,
    };
    return res.status(200).cookie('token', token, options).json({
        success: true,
        message: 'Logged in successfully',
    });
}));
//* Get User Profile
exports.myProfile = (0, errorMiddleware_1.asyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const { id } = req.user;
        const user = yield user_schema_1.default.findById(id);
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error,
        });
    }
}));
//* Logout User
exports.Logout = (0, errorMiddleware_1.asyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });
    res.status(200).json({
        success: true,
        message: 'Logged Out',
    });
}));
exports.followUser = (0, errorMiddleware_1.asyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (!((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.id)) {
        return next(new errorHandler_1.default('no user id', 400));
    }
    const followingTo = yield follower_schema_1.default.findOne({ userId: (_b = req === null || req === void 0 ? void 0 : req.params) === null || _b === void 0 ? void 0 : _b.id }).catch((err) => {
        console.log('err', err);
        return next(new errorHandler_1.default('something went wront', 400));
    });
    if (!followingTo) {
        return next(new errorHandler_1.default('user not exists', 400));
    }
    // @ts-ignore
    const currentUser = yield follower_schema_1.default.findOne({ userId: (_c = req === null || req === void 0 ? void 0 : req.user) === null || _c === void 0 ? void 0 : _c.id }).catch((err) => {
        console.log('err', err);
        return next(new errorHandler_1.default('something went wront', 400));
    });
    // @ts-ignore
    if (currentUser === null || currentUser === void 0 ? void 0 : currentUser.following.includes((_d = req === null || req === void 0 ? void 0 : req.params) === null || _d === void 0 ? void 0 : _d.id)) {
        return next(new errorHandler_1.default('You are already following the user', 400));
    }
    // @ts-ignore
    (_e = currentUser === null || currentUser === void 0 ? void 0 : currentUser.following) === null || _e === void 0 ? void 0 : _e.push((_f = req === null || req === void 0 ? void 0 : req.params) === null || _f === void 0 ? void 0 : _f.id);
    currentUser === null || currentUser === void 0 ? void 0 : currentUser.save().catch((err) => {
        console.log('err', err);
        return next(new errorHandler_1.default('something went wront', 400));
    });
    // @ts-ignore
    (_g = followingTo === null || followingTo === void 0 ? void 0 : followingTo.followers) === null || _g === void 0 ? void 0 : _g.push((_h = req === null || req === void 0 ? void 0 : req.user) === null || _h === void 0 ? void 0 : _h.id);
    followingTo === null || followingTo === void 0 ? void 0 : followingTo.save().catch((err) => {
        console.log('err', err);
        return next(new errorHandler_1.default('something went wront', 400));
    });
    return res.status(200).json({
        success: true,
    });
}));
exports.unFollowUser = (0, errorMiddleware_1.asyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k, _l, _m, _o, _p, _q;
    if (!((_j = req === null || req === void 0 ? void 0 : req.params) === null || _j === void 0 ? void 0 : _j.id)) {
        return next(new errorHandler_1.default('no user id', 400));
    }
    const followingTo = yield follower_schema_1.default.findOne({ userId: (_k = req === null || req === void 0 ? void 0 : req.params) === null || _k === void 0 ? void 0 : _k.id })
        .catch((err) => {
        console.log('err', err);
        return next(new errorHandler_1.default('something went wront', 400));
    });
    if (!followingTo) {
        return next(new errorHandler_1.default('user not exists', 400));
    }
    // @ts-ignore
    const currentUser = yield follower_schema_1.default.findOne({ userId: (_l = req === null || req === void 0 ? void 0 : req.user) === null || _l === void 0 ? void 0 : _l.id }).catch((err) => {
        console.log('err', err);
        return next(new errorHandler_1.default('something went wront', 400));
    });
    // @ts-ignore
    console.log('currentUser?.following', currentUser === null || currentUser === void 0 ? void 0 : currentUser.following.includes((_m = req === null || req === void 0 ? void 0 : req.params) === null || _m === void 0 ? void 0 : _m.id));
    // @ts-ignore
    if ((currentUser === null || currentUser === void 0 ? void 0 : currentUser.following.includes((_o = req === null || req === void 0 ? void 0 : req.params) === null || _o === void 0 ? void 0 : _o.id)) === false) {
        return next(new errorHandler_1.default('user not exists in your Following list', 400));
    }
    // @ts-ignore
    currentUser === null || currentUser === void 0 ? void 0 : currentUser.following = (_p = currentUser === null || currentUser === void 0 ? void 0 : currentUser.following) === null || _p === void 0 ? void 0 : _p.filter((x) => { var _a; return String(x) !== ((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.id); });
    currentUser === null || currentUser === void 0 ? void 0 : currentUser.save().catch((err) => {
        console.log('err', err);
        return next(new errorHandler_1.default('something went wront', 400));
    });
    // @ts-ignore
    followingTo === null || followingTo === void 0 ? void 0 : followingTo.followers = (_q = currentUser === null || currentUser === void 0 ? void 0 : currentUser.following) === null || _q === void 0 ? void 0 : _q.filter((x) => { var _a; return String(x) !== ((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id); });
    followingTo === null || followingTo === void 0 ? void 0 : followingTo.save().catch((err) => {
        console.log('err', err);
        return next(new errorHandler_1.default('something went wront', 400));
    });
    return res.status(200).json({
        success: true,
    });
}));
exports.getAllusers = (0, errorMiddleware_1.asyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _r;
    // @ts-ignore
    const result = yield (user_schema_1.default === null || user_schema_1.default === void 0 ? void 0 : user_schema_1.default.find().where('_id').ne((_r = req === null || req === void 0 ? void 0 : req.user) === null || _r === void 0 ? void 0 : _r.id).catch((err) => {
        console.log('err', err);
        return next(new errorHandler_1.default('something went wront', 400));
    }));
    return res.status(200).json({
        success: true,
        data: result
    });
}));
exports.getFollowingUsers = (0, errorMiddleware_1.asyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _s, _t;
    // @ts-ignore
    const result = yield (follower_schema_1.default === null || follower_schema_1.default === void 0 ? void 0 : follower_schema_1.default.findOne({ userId: (_s = mongoose_1.default === null || mongoose_1.default === void 0 ? void 0 : mongoose_1.default.Types) === null || _s === void 0 ? void 0 : _s.ObjectId((_t = req === null || req === void 0 ? void 0 : req.user) === null || _t === void 0 ? void 0 : _t.id) }).catch((err) => {
        console.log('err', err);
        return next(new errorHandler_1.default('something went wront', 400));
    }));
    return res.status(200).json({
        success: true,
        data: result
    });
}));
