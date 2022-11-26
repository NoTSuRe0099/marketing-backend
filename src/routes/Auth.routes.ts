import express from 'express';
import authController from '../controllers/auth.controller';

import { isAuthenticatedUser } from '../middleware/AuthMiddleware';

const router = express.Router();

router.route('/register').post(authController.Register);

router.route('/login').post(authController.Login);

router.route('/me').get(isAuthenticatedUser, authController.myProfile);

router.route('/logout').get(authController.Logout);

router.get('/:id/verify/:token/', authController.verifyUser);

router.post('/requestPasswordReset', authController.requestPasswordReset);

router.post('/resetPassword', authController.resetPassword);

export default router;
