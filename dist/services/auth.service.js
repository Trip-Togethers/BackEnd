"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = __importDefault(require("../data-source"));
const user_entity_1 = require("../entities/user.entity");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
// JWT 비밀키
const JWT_SECRET = process.env.PRIVATE_KEY || "default_secret_key";
// 사용자 검증 및 토큰 발행
const authenticateUser = async (id, username, email) => {
    // User 리포지토리에서 사용자 찾기
    const userRepository = data_source_1.default.getRepository(user_entity_1.User);
    const user = await userRepository.findOneBy({ id, username, email });
    if (!user) {
        throw new Error("Invalid credentials");
    }
    // JWT 토큰 발행
    const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, email: user.email }, // 사용자 정보 (payload)
    JWT_SECRET, // 비밀 키
    { expiresIn: "10m" } // 만료 시간 (1시간)
    );
    return token;
};
exports.authenticateUser = authenticateUser;
//# sourceMappingURL=auth.service.js.map