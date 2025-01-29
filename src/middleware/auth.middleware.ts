import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: '로그인 후 이용해주세요.' });
      return;
    }

    const token = authHeader
    if (!token) {
      res.status(401).json({ message: '토큰 형식이 잘못되었습니다.' });
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
      return;
    }

    (req as any).user = decoded;
    console.log(decoded)
    next();
  } catch (error: any) {
    console.error(error);
    res.status(401).json({ message: '인증 오류가 발생했습니다.' });
  }
}
