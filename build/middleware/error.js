"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';
    // Wrong Mongodb Id error
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new errorHandler_1.default(message, 400);
    }
    // Mongoose duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new errorHandler_1.default(message, 400);
    }
    // Wrong JWT error
    if (err.name === 'JsonWebTokenError') {
        const message = 'Json Web Token is invalid, Try again ';
        err = new errorHandler_1.default(message, 400);
    }
    // JWT EXPIRE error
    if (err.name === 'TokenExpiredError') {
        const message = 'Json Web Token is Expired, Try again ';
        err = new errorHandler_1.default(message, 400);
    }
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
