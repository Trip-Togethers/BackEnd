import { Request, Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service';

const profileService = new ProfileService();

export class ProfileController {
  // 닉네임 변경
  static async updateNickname(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = Number(req.params.userId);
      const { nickname } = req.body;

      const updatedUser = await profileService.updateNickname(userId, nickname);
      res.status(200).json({ message: '닉네임이 변경되었습니다.', user: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  // 비밀번호 변경
  static async updatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = Number(req.params.userId);
      const { newPassword } = req.body;

      await profileService.updatePassword(userId, newPassword);
      res.status(200).json({ message: '비밀번호가 변경되었습니다.' });
    } catch (error) {
      next(error);
    }
  }

  // 회원 탈퇴
  static async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = Number(req.params.userId);

      await profileService.deleteAccount(userId);
      res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' });
    } catch (error) {
      next(error);
    }
  }
}
