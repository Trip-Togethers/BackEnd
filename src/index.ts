import express from "express";
import mainPageRouter from "./routes/schedule"; // src/routes/mainpage.ts
import dotenv from "dotenv";
import AppDataSource from "./data-source";

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
      .then((tables) => {
        console.log("Tables in the database:", tables);
      })
      .catch((err) => {
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
app.use("/trips", mainPageRouter);

app.get("/", (req, res) => {
  res.send("Hello, Express");
});
