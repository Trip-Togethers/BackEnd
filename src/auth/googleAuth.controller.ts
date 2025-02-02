import { Request, Response } from 'express';

export class GoogleAuthController {
  static async googleAuthCallback(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ message: 'Google 로그인 실패' });
      return;
    }

    res.status(200).json({
      message: 'Google 로그인 성공',
      user: req.user,
    });
  }

  static async logout(req: Request, res: Response): Promise<void> {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: '로그아웃 중 오류 발생' });
      }
      res.status(200).json({ message: '로그아웃 성공' });
    });
  }
}
