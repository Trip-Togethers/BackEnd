import { Router } from 'express';
import passport from 'passport';
import { GoogleAuthController } from './googleAuth.controller';

const router = Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  GoogleAuthController.googleAuthCallback
);
router.get('/logout', GoogleAuthController.logout);

export default router;
