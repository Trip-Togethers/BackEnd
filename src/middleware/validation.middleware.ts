import { Request, Response, NextFunction } from 'express';
import { validateEmail, validatePassword } from '../utils/validation.util';

export function registerValidation(req: Request, res: Response, next: NextFunction): void {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: '이메일과 비밀번호가 필요합니다.' });
      return;
    }

    if (!validateEmail(email)) {
      res.status(400).json({ message: '이메일 형식이 올바르지 않습니다.' });
      return;
    }

    if (!validatePassword(password)) {
      res.status(400).json({ message: '비밀번호 형식이 올바르지 않습니다.' });
      return;
    }

    next();
  } catch (error: any) {
    console.error('Validation Middleware Error:', error);
    res.status(500).json({ message: '검증 과정에서 오류가 발생했습니다.' });
  }
}
