import express, { NextFunction, Request, Response } from 'express';
import './config/config';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import morgan from 'morgan';
import cloudinary from 'cloudinary';
import { Server } from 'socket.io';
import http from 'http';
import webpush from 'web-push';
import ConnectDB from './config/database';
import PostRoutes from './routes/post.routes';
import AuthRoutes from './routes/Auth.routes';
import UserRoutes from './routes/user.routes';
import { errorMiddleware } from './middleware/errorMiddleware';
import socketController from './controllers/socket.controller';

const app = express();
const server = http.createServer(app);
app.use(
  cors({
    origin: [
      '*',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://192.168.0.102:3000',
      `${process.env.FRONTEND_URL}`,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }),
);

ConnectDB();
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(
  fileUpload({
    useTempFiles: true,
  }),
);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', String(process.env.FRONTEND_URL)],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }
});

app.use((req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  req.io = io;
  return next();
});

io.use(async (socket, next) => {
  const { userId } = socket.handshake.auth;

  if (!userId) {
    return next(new Error('invalid socket-auth'));
  }

  await socketController.createOrUpdateUserSocketId(userId, socket.id)
    .catch((e: any) => next(new Error('something went wrong  "createOrUpdateUserSocketId" ')));

  return next();
});

io.on('connection', async (socket) => {
  console.log('new Socket connection ==>', socket?.id);
});

// ? ------> Cludinary Global Config!
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

app.get('/', (req, res) => {
  res.send('hello there');
});

app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/user', UserRoutes);
app.use('/api/v1/posts', PostRoutes);

//* ****************Push notification Route *******************//
const publicVapidKey = process.env.WEB_PUSH_PUBLIC_KEY;
const privateVapidKey = process.env.WEB_PUSH_PRIVATE_KEY;
webpush.setVapidDetails(
  'mailto:test@test.com',
  String(publicVapidKey),
  String(privateVapidKey)
);
app.post('/subscribe', (req, res) => {
  const { subscription, title, message } = req.body;
  console.log('comming from client ===>', subscription, title, message);
  const payload = JSON.stringify({ title, message });
  webpush.sendNotification(subscription, payload)
    .catch((err) => console.error('err', err));
  res.status(200).json({ success: true });
});

app.use(errorMiddleware);

server.listen(5000 || process.env.PORT, () => {
  console.log(`server is running on:- http://localhost:${process.env.PORT}`);
});
