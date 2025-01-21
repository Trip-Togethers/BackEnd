"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.login = void 0;
const userService_1 = require("../services/userService");
const auth_service_1 = require("../services/auth.service");
// 회원 가입
const login = async (req, res) => {
    const { username, email } = req.body;
    try {
        await (0, userService_1.inserUser)(username, email);
        res.status(201).send({
            message: "User created successfully",
        });
    }
    catch (error) {
        res.status(500).send({ message: "Error creating user", error });
    }
};
exports.login = login;
// 로그인
const loginUser = async (req, res) => {
    const { id, username, email } = req.body;
    try {
        // 사용자 인증 및 JWT 토큰 발행
        const token = await (0, auth_service_1.authenticateUser)(id, username, email);
        res.status(200).json({ token });
    }
    catch (error) {
        res.status(401).send({
            message: "Unknown error occurred",
        });
    }
};
exports.loginUser = loginUser;
//# sourceMappingURL=user.controller.js.map