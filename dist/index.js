"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const schedule_1 = __importDefault(require("./routes/schedule")); // src/routes/mainpage.ts
const user_1 = __importDefault(require("./routes/user")); // src/routes/mainpage.ts
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = __importDefault(require("./data-source"));
// dotenv 모듈 로드
dotenv_1.default.config();
// express 앱 초기화
const app = (0, express_1.default)();
// JSON 바디 파싱 미들웨어 추가
app.use(express_1.default.json());
data_source_1.default.initialize()
    .then(() => {
    console.log("Database connected");
    // 데이터베이스에서 테이블 목록 가져오기
    data_source_1.default.query("SHOW TABLES")
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
    .catch((error) => {
    console.log("Database connection failed", error);
});
// 라우터 설정
app.use("/trips", schedule_1.default);
app.use("/users", user_1.default);
app.get("/", (req, res) => {
    res.send("Hello, Express");
});
//# sourceMappingURL=index.js.map