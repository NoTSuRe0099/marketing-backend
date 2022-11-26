/* eslint-disable max-len */
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../model/user.schema';
import ErrorHandler from '../utils/errorHandler';
import { asyncError } from './errorMiddleware';

export const isAuthenticatedUser = asyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.cookies;

  console.log('token auth middleware', token);

  if (!token) {
    return next(new ErrorHandler('Unauthorized please login', 401));
  }

  const decodedData = jwt.verify(token, String(process.env.JWT_SECRET));

  // @ts-ignore
  req.user = await User.findById(decodedData.id);

  return next();
});

export const authorizeRoles = (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  if (!roles.includes(req.user.role)) {
    return next(
      new ErrorHandler(
        // @ts-ignore
        `Role: ${req.user.role} is not allowed to access this resouce `,
        403,
      ),
    );
  }

  return next();
};
