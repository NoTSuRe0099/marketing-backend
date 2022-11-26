import express from 'express';
import userController from '../controllers/user.controller';

import { isAuthenticatedUser } from '../middleware/AuthMiddleware';

const router = express.Router();

router.route('/followUser/:id').get(isAuthenticatedUser, userController.followUser);

router.route('/unfollowUser/:id').get(isAuthenticatedUser, userController.unFollowUser);

router.route('/getAllusers').get(isAuthenticatedUser, userController.getAllusers);

router.get('/getFollowersAndFollowingUsers', isAuthenticatedUser, userController.getFollowingUsers);

export default router;
