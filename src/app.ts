import express, { Application } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

// Google OAuth 설정 파일 추가
import './auth/googleAuth.strategy';

// 라우트
import authRoutes from './routes/auth.routes';
import googleAuthRoutes from './auth/googleAuth.routes';  // ✅ 경로 확인!
import userRoutes from './routes/user.routes';
import profileRoutes from './routes/profile.routes';

export const app: Application = express();

// 기본 미들웨어
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 세션 설정 (OAuth 로그인 유지)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
  })
);

// Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// 라우트 등록
app.use('/auth', googleAuthRoutes); // ✅ Google OAuth 라우트 등록
app.use('/users', authRoutes);
app.use('/users', userRoutes);
app.use('/profile', profileRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

export default app;
