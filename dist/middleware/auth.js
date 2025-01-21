"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ensureAuthorization = (req, res) => {
    try {
        const receivedJwt = req.headers["authorization"];
        if (!receivedJwt) {
            console.warn("Authorization header is missing");
            return null; // 헤더가 없으면 null 반환
        }
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            throw new Error("Private key is not defined in environment variables");
        }
        const decodedJwt = jsonwebtoken_1.default.verify(receivedJwt, privateKey);
        return decodedJwt; // 정상적인 JWT 디코딩 후 반환
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return err; // 만료된 토큰은 그대로 반환
        }
        console.error("Unexpected error during authorization:", err);
        throw err; // 예상치 못한 에러는 다시 던짐
    }
};
exports.default = ensureAuthorization;
//# sourceMappingURL=auth.js.map