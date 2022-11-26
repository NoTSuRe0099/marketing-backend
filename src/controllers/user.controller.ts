import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncError } from '../middleware/errorMiddleware';
import followerSchema from '../model/follower.schema';
import User from '../model/user.schema';
import ErrorHandler from '../utils/errorHandler';
import socketController from './socket.controller';

const userController = {
  //* Follow User
  followUser: asyncError(async (req: Request, res: Response, next: NextFunction) => {
    if (!req?.params?.id) {
      return next(new ErrorHandler('no user id', 400));
    }

    const followingTo = await followerSchema.findOne({ userId: req?.params?.id }).catch((err) => {
      console.log('err', err);
      return next(new ErrorHandler('something went wront', 400));
    });

    if (!followingTo) {
      return next(new ErrorHandler('user not exists', 400));
    }

    // @ts-ignore
    const currentUser = await followerSchema.findOne({ userId: req?.user?.id }).catch((err) => {
      console.log('err', err);
      return next(new ErrorHandler('something went wront', 400));
    });
    // @ts-ignore
    if (currentUser?.following.includes(req?.params?.id)) {
      return next(new ErrorHandler('You are already following the user', 400));
    }

    // @ts-ignore
    currentUser?.following?.push(req?.params?.id);
    currentUser?.save().catch((err) => {
      console.log('err', err);
      return next(new ErrorHandler('something went wront', 400));
    });

    // @ts-ignore
    followingTo?.followers?.push(req?.user?.id);
    followingTo?.save().catch((err) => {
      console.log('err', err);
      return next(new ErrorHandler('something went wront', 400));
    });

    const followingToSocketID = await socketController.findSocketIdByUserId(req?.params?.id);
    // @ts-ignore
    req?.io?.to(followingToSocketID).emit('NOTIFICATION', {
      // @ts-ignore
      notificationMsg: `@${req?.user?.username} Started following you 😀`
    });

    return res.status(200).json({
      success: true,
    });
  }),

  //* Unfollow User
  unFollowUser: asyncError(async (req: Request, res: Response, next: NextFunction) => {
    if (!req?.params?.id) {
      return next(new ErrorHandler('no user id', 400));
    }

    const followingTo: any = await followerSchema.findOne({ userId: req?.params?.id })
      .catch((err) => {
        console.log('err', err);
        return next(new ErrorHandler('something went wront', 400));
      });

    if (!followingTo) {
      return next(new ErrorHandler('user not exists', 400));
    }

    // @ts-ignore
    const currentUser = await followerSchema.findOne({ userId: req?.user?.id }).catch((err) => {
      console.log('err', err);
      return next(new ErrorHandler('something went wront', 400));
    });
    // @ts-ignore
    console.log('currentUser?.following', currentUser?.following.includes(req?.params?.id));

    // @ts-ignore
    if (currentUser?.following.includes(req?.params?.id) === false) {
      return next(new ErrorHandler('user not exists in your Following list', 400));
    }

    // @ts-ignore
    currentUser.following =
      currentUser?.following?.filter((x: any) => String(x) !== req?.params?.id);
    currentUser?.save().catch((err) => {
      console.log('err', err);
      return next(new ErrorHandler('something went wront', 400));
    });

    // @ts-ignore
    followingTo.followers = followingTo?.followers?.filter((x: any) => String(x) !== req?.user?.id);
    followingTo?.save().catch((err: any) => {
      console.log('err', err);
      return next(new ErrorHandler('something went wront', 400));
    });

    return res.status(200).json({
      success: true,
    });
  }),

  //* GetAll Users
  getAllusers: asyncError(async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const result = await User?.find().where('_id').ne(req?.user?._id).catch((err) => {
      console.log('err', err);
      return next(new ErrorHandler('something went wront', 400));
    });
    return res.status(200).json({
      success: true,
      data: result
    });
  }),

  //* Get FollowingUsers
  getFollowingUsers: asyncError(async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    // eslint-disable-next-line max-len
    const result = await followerSchema?.findOne({ userId: mongoose?.Types?.ObjectId(req?.user?.id) })
      .catch((err) => {
        console.log('err', err);
        return next(new ErrorHandler('something went wront', 400));
      });
    return res.status(200).json({
      success: true,
      data: result
    });
  }),
};

export default userController;
