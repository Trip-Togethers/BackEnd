import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { GoogleAuthService } from './googleAuth.service';
import dotenv from 'dotenv';

dotenv.config();

const googleAuthService = new GoogleAuthService();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://trip-together.co.kr/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await googleAuthService.findOrCreateGoogleUser(profile);
        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

// Serialize user
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id: number, done) => {
  const user = await googleAuthService.findUserById(id);
  done(null, user);
});
