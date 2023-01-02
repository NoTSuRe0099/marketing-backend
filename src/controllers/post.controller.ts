import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncError } from '../middleware/errorMiddleware';
import followerSchema from '../model/follower.schema';
import postSchema from '../model/post.schema';
import socketsSchema from '../model/sockets.schema';
import ErrorHandler from '../utils/errorHandler';
import { createPostValidation } from '../validators/post.validator';

const postController = {
  createPost: asyncError(async (req: Request, res: Response, next: NextFunction) => {
    const data = await createPostValidation.validateAsync(req?.body);
    // @ts-ignore
    console.log('req.user.id', req.user.id);
    // @ts-ignore
    const result: any = await postSchema?.create({ ...data, userId: req.user.id })
      .catch((err) => {
        console.log('err', err);
        return next(new ErrorHandler('something went wront', 400));
      });
    // @ts-ignore
    const currentUser: any = await followerSchema?.findOne({ userId: req.user.id });

    console.log('currentUser', currentUser);

    const followersList =
      await socketsSchema.find({ userId: { $in: currentUser?.followers } });

    console.log('followersList', followersList);

    const followerSocketIDS = followersList?.map((user: any) => user?.socketId);

    console.log('followerSocketIDS', followerSocketIDS);

    const newPostShape = {
      _id: result?._id,
      userId: result?.userId,
      title: result?.title,
      description: result?.description,
      // @ts-ignore
      createdAt: result?.createdAt,
      userInfo: {
        // @ts-ignore
        email: req?.user?.email,
        // @ts-ignore
        username: req?.user?.username,
        // @ts-ignore
        avatar: req?.user?.avatar,
      }
    };

    if (followerSocketIDS?.length > 0) {
      // @ts-ignore
      await req.io.to(followerSocketIDS).emit('NEW_POST', {
        // @ts-ignore
        notificationMsg: `@${req?.user?.username} has created New Post 🖐️`,
        data: newPostShape
      });
    }

    return res.status(201).json({
      success: true,
      message: 'New post created',
      data: newPostShape
    });
  }),

  getPosts: asyncError(async (req: Request, res: Response, next: NextFunction) => {
    const page: number = Number(req?.query?.page) || Number(1);
    const limit: number = Number(req?.query?.limit) || Number(999);
    const skip = (page - 1) * limit;

    const posts: any = await followerSchema?.aggregate([
      {
        // @ts-ignore
        $match: { userId: mongoose.Types.ObjectId(req.user._id) },
      },

      {
        $project: {
          _id: 1,
          userId: 1,
          followers: 1,
          following: {
            // @ts-ignore
            $concatArrays: ['$following', [mongoose.Types.ObjectId(req.user._id)]]
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
    ]).sort({ createdAt: -1 }).skip(skip)
      .limit(limit)
      .catch((err) => {
        console.log('err', err);
        return next(new ErrorHandler('something went wront', 400));
      });

    // console.log('posts', posts);

    return res.status(200).json({
      success: true,
      data: posts
    });
  })
};

export default postController;
