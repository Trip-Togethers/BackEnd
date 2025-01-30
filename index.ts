import express from "express";
import dotenv from "dotenv";
import AppDataSource from "./src/data-source";
import mainPageRouter from './src/routes/schedule'
import detailPageRouter from './src/routes/detail.schedule'
import guestPageRouter from './src/routes/guest'
import calendarRoutes from './src/routes/calendar.routes'
import postsRouter from './src/routes/community.routes'
import authRoutes from './src/routes/auth.routes'
import googleAuthRoutes from './src/auth/googleAuth.routes'
import userRoutes from './src/routes/user.routes'
import profileRoutes from './src/routes/profile.routes'
import mapsRouter from './src/routes/maps.routes'
import { TableType } from "typeorm/metadata/types/TableTypes.js";

// dotenv 모듈 로드
dotenv.config();

// express 앱 초기화
const app = express();

// JSON 바디 파싱 미들웨어 추가
app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    // 데이터베이스에서 테이블 목록 가져오기
    AppDataSource.query("SHOW TABLES")
      .then((tables: TableType[]) => {
        console.log("Tables in the database:", tables);
      })
      .catch((err: Error) => {
        console.error("Error fetching tables:", err);
      });

    // 서버 실행
    app.listen(process.env.PORT, () => {
      console.log(`${process.env.PORT}번 포트에서 대기 중`);
    });
  })
  .catch((error: Error) => {
    console.log("Database connection failed", error);
  });

// 라우터 설정
app.use('/users', authRoutes);                      // User
app.use('/auth', googleAuthRoutes);
app.use('/users', userRoutes);
app.use('/profile', profileRoutes);
app.use("/trips", mainPageRouter);                  // Schedule
app.use("/trips/activities", detailPageRouter)      // DetailSchedule
app.use("/trips/companions", guestPageRouter)       // Guest
app.use("/calendar", calendarRoutes)                // Calendar
app.use("/posts", postsRouter)                      // Post
app.use("/maps", mapsRouter)                        // Map


