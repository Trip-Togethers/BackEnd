import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = Number(req.params.user_id);
      const { nickname, email, newPassword } = req.body;
      await userService.updateProfile(userId, nickname, email, newPassword);

      res.status(200).json({ message: '프로필 수정 완료' });
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }

  static async getUserMenu(req: Request, res: Response): Promise<void> {
    try {
      const userId = Number(req.params.user_id);
      const menu = await userService.getUserMenu(userId);

      res.status(200).json({ menu });
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }

  static async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const userId = Number(req.params.user_id);
      await userService.deleteAccount(userId);

      res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' });
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }
}
