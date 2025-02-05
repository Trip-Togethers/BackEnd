import 'reflect-metadata';
import express from "express";
import dotenv from "dotenv";
import AppDataSource from "./src/data-source";
import mainPageRouter from './src/routes/schedule';
import detailPageRouter from './src/routes/detail.schedule';
import guestPageRouter from './src/routes/guest';
import calendarRoutes from './src/routes/calendar.routes';
import postsRouter from './src/routes/community.routes';
import authRoutes from './src/routes/auth.routes';
import googleAuthRoutes from './src/auth/googleAuth.routes';
import mapsRouter from './src/routes/maps.routes';
import { TableType } from "typeorm/metadata/types/TableTypes.js";
import cors from 'cors';
import cookieParser from 'cookie-parser';

// dotenv 모듈 로드
dotenv.config();

// express 앱 초기화
const app = express();

app.use(cookieParser());

const corsOptions = {
  origin: ["http://localhost:5173"], // 허용할 프론트엔드 도메인
  credentials: true,               // 쿠키 허용
};

app.use(cors(corsOptions)); 

// 프리플라이트 요청 허용
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Set-Cookie, set-cookie"
  );
  next();
});
// JSON 바디 파싱 미들웨어 추가
app.use(express.json());

// 비동기 함수로 데이터베이스 연결 및 서버 실행
const initializeApp = async () => {
  try {
    console.log("Initializing database connection...");
    
    // 데이터베이스 연결
    await AppDataSource.initialize();
    console.log("Database connected");

    // 데이터베이스에서 테이블 목록 가져오기
    const tables = await AppDataSource.query("SHOW TABLES");
    console.log("Tables in the database:", tables);

    // 서버 실행
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`${port}번 포트에서 대기 중`);
    });
  } catch (error) {
    console.error("Database connection failed", error);
  }
};

// 앱 초기화 호출
initializeApp();

// 라우터 설정
app.use('/users', authRoutes);                      // User
app.use('/auth', googleAuthRoutes);
app.use("/trips", mainPageRouter);                  // Schedule
app.use("/trips/activities", detailPageRouter)      // DetailSchedule
app.use("/trips/companions", guestPageRouter)       // Guest
app.use("/calendar", calendarRoutes)                // Calendar
app.use("/posts", postsRouter)                      // Post
app.use("/maps", mapsRouter);                       // Map
