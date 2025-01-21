"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controller/user.controller");
const router = (0, express_1.Router)();
// 회원가입
router.post("/join", (req, res) => (0, user_controller_1.login)(req, res));
// 로그인
router.post("/login", (req, res) => (0, user_controller_1.loginUser)(req, res));
exports.default = router;
//# sourceMappingURL=user.js.map