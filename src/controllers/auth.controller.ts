/* eslint-disable max-len */
import Cloudinary from 'cloudinary';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose, { ObjectId } from 'mongoose';
import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import path from 'path';
import ejs from 'ejs';
import { asyncError } from '../middleware/errorMiddleware';
import User from '../model/user.schema';
import ErrorHandler from '../utils/errorHandler';
import { registerValidation } from '../validators/Auth.validator';
import followerSchema from '../model/follower.schema';
import socketController from './socket.controller';
import TokenSchema from '../model/token.schema';
import sendMail from '../utils/sendMail';

const cloudinary = Cloudinary.v2;

const authController = {
  //* Register User
  Register: asyncError(async (req: Request, res: Response, next: NextFunction) => {
    const data = await registerValidation.validateAsync(req?.body);
    const {
      username,
      email,
      password,
      firstname,
      lastname,
    } = data;

    const user: any = await User.findOne({ email });

    if (user) {
      return next(new ErrorHandler('Email already registered', 400));
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

    const hashedPassword: any = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      firstname,
      lastname,
      // avatar,
    });

    await followerSchema.create({
      userId: newUser?._id,
    });

    const token = await new TokenSchema({
      userId: newUser?._id,
      token: crypto.randomBytes(32).toString('hex'),
    }).save();
    const url = `${process.env.FRONTEND_URL}/users/${newUser?._id}/verify/${token?.token}`;
    // console.log('verify URL', url);
    const templatePath = path.join(__dirname, '../template/verifyEmailTemplate.ejs');
    const html = await ejs.renderFile(templatePath, {
      name: firstname,
      verifylink: url
    });
    await sendMail(newUser?.email, 'Verify Email Trading App', html);

    return res.status(200).json({
      success: true,
      message: 'An Email sent to your account please verify',
    });
  }),

  //* Verify User Email
  verifyUser: asyncError(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User?.findOne({ _id: req?.params?.id });
    if (!user) return res?.status(400).json({ success: false, message: 'Invalid link' });

    const token = await TokenSchema.findOne({
      userId: user?._id,
      token: req?.params?.token,
    });

    if (!token) return next(new ErrorHandler('Invalid link', 400));

    await User.updateOne({ _id: user?._id, verified: true });
    await token.remove();

    return res.status(200).json({ success: true, message: 'Email verified successfully' });
  }),

  requestPasswordReset: asyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) return next(new ErrorHandler('Email not Found', 404));
    const token = await TokenSchema.findOne({ userId: user?._id });
    if (token) await token.deleteOne();
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetToken, 10);

    await new TokenSchema({
      userId: user?._id,
      token: hash,
      createdAt: Date.now(),
    }).save();
    // client route '/passwordReset/:resetToken/:id';
    const link = `${process.env.FRONTEND_URL}/passwordReset/${resetToken}/${user?._id}`;
    const templatePath = path.join(__dirname, '../template/passowrdReestEmailTemplate.ejs');
    const html = await ejs.renderFile(templatePath, {
      name: user?.firstname,
      resetPasswordLink: link
    });
    await sendMail(String(user?.email), 'Password Reset Request', html);
    return res.status(200).json({
      success: true,
      message: 'Password Reset Link send to your Email'
    });
  }),

  resetPassword: asyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { userId, token, password } = req.body;
    const passwordResetToken = await TokenSchema.findOne({ userId });
    if (!passwordResetToken) {
      return next(new ErrorHandler('Invalid or expired password reset link', 400));
    }
    const isValid = await bcrypt.compare(token, passwordResetToken.token);
    if (!isValid) {
      return next(new ErrorHandler('Invalid or expired password reset link', 400));
    }
    const hash = await bcrypt.hash(password, 10);
    await User.updateOne(
      { _id: userId },
      { $set: { password: hash } },
      { new: true }
    );
    const user = await User.findById({ _id: userId });
    await sendMail(
      String(user?.email),
      'Password Reset Successfully',
      'Your Password Reset Successfully',
    );
    await passwordResetToken.deleteOne();
    return res.status(200).json({
      success: true,
      message: 'Your Password Reset Successfully'
    });
  }),

  //* Login User
  Login: asyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Email not found',
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const isMatch = await comparePassword(password, user?.password);

    if (!isMatch) {
      return res.status(403).json({
        success: false,
        message: 'Password is incorrect',
      });
    }

    if (!user?.verified) {
      let token = await TokenSchema.findOne({ userId: user?._id });
      if (!token) {
        token = await new TokenSchema({
          userId: user?._id,
          token: crypto.randomBytes(32).toString('hex'),
        }).save();

        const url = `${process.env.FRONTEND_URL}/users/${user?._id}/verify/${token?.token}`;
        console.log('verify URL', url);
        const templatePath = path.join(__dirname, '../template/verifyEmailTemplate.ejs');
        const html = await ejs.renderFile(templatePath, {
          name: user?.firstname,
          verifylink: url
        });
        await sendMail(user?.email, 'Verify Email Trading App', html);
      }

      return res
        .status(400)
        .send({ message: 'An Email sent to your account please verify' });
    }

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const token = await generateToken(`${user?._id}`);
    const options = {
      expires: new Date(Date.now() + 48 * 60 * 60 * 1000),
      httpOnly: true,
    };
    return res.status(200).cookie('token', token, options).json({
      success: true,
      message: 'Logged in successfully',
    });
  }),
  //*  UserMe
  myProfile: asyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const { id } = req.user;
      const user = await User.findById(id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error,
      });
    }
  }),

  //* Logout
  Logout: asyncError(async (req: Request, res: Response, next: NextFunction) => {
    res.cookie('token', null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'Logged Out',
    });
  }),

};

async function generateToken(userId: ObjectId | any) {
  const token: string = await jwt.sign({ id: userId }, `${process.env.JWT_SECRET}`);
  return token;
}

async function comparePassword(bodyPass: string, hashPass: string) {
  const isMatch: boolean = await bcrypt.compare(bodyPass, hashPass);
  return isMatch;
}

export default authController;
