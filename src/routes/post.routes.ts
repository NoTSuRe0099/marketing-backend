import express from 'express';
import postController from '../controllers/post.controller';
import { isAuthenticatedUser } from '../middleware/AuthMiddleware';

const router = express.Router();

router.route('/').post(isAuthenticatedUser, postController.createPost).get(isAuthenticatedUser, postController.getPosts);

export default router;
