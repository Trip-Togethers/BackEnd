import 'express-async-errors';
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';

// 라우트
import authRoutes from './routes/auth.routes';
//import googleAuthRoutes from './routes/googleAuth.routes';
import userRoutes from './routes/user.routes';

export const app: Application = express();

// 기본 미들웨어
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 세션 설정
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
app.use('/users', authRoutes);
//app.use('/users', googleAuthRoutes);
app.use('/users', userRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// 에러 핸들링
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});
