"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("./config/config");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const database_1 = __importDefault(require("./config/database"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const Auth_routes_1 = __importDefault(require("./routes/Auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://192.168.0.102:3000',
        `${process.env.FRONTEND_URL}`,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
(0, database_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.urlencoded({
    extended: true,
}));
app.use((0, express_fileupload_1.default)({
    useTempFiles: true,
}));
// ? ------> Cludinary Global Config!
cloudinary_1.default.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
app.get('/', (req, res) => {
    res.send('hello there');
});
app.use('/api/v1/auth', Auth_routes_1.default);
app.use('/api/v1/user', user_routes_1.default);
app.use('/api/v1/posts', post_routes_1.default);
app.use(errorMiddleware_1.errorMiddleware);
app.listen(5000 || process.env.PORT, () => {
    console.log(`server is running on:- http://localhost:${process.env.PORT}`);
});
