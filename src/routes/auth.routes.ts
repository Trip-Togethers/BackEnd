import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { registerValidation } from '../middleware/validation.middleware';

const router = Router();

// 회원가입
router.post('/register', registerValidation, AuthController.register);

// 이메일 인증
router.post('/verify-email', AuthController.verifyEmail);

// 이메일 중복 확인
router.get('/check-email', AuthController.checkEmail);

// 로그인
router.post('/login', AuthController.login);

// 로그아웃
router.delete('/logout', AuthController.logout);

export default router;

