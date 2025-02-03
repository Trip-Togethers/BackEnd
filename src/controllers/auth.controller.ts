import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { StatusCodes } from "http-status-codes";

const authService = new AuthService();

export class AuthController {
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    
    const { email, password } = req.body;

    try {
      if (!email) {
        res.status(400).json({ message: "이메일을 입력해주세요." });
        return;
      }
      const isDuplicate = await authService.checkEmailDuplicate(email);
      if (isDuplicate) {
         res.status(409).json({ message: "이미 사용 중인 이메일입니다." });
         return;
      } 

      await authService.register(email, password);

      res.status(StatusCodes.OK).json({
        message: "회원가입 완료. 이메일 인증을 진행해주세요.",
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async verifyEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, code } = req.body;
      const result = await authService.verifyEmail(email, code);
      if (!result) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "인증 코드가 올바르지 않습니다." });
        return;
      }
      res.status(StatusCodes.OK).json({ message: "이메일 인증 완료" });
    } catch (error: any) {
      next(error);
    }
  }

  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const token = await authService.login(email, password);
      res.status(StatusCodes.OK).json({ message: "로그인 성공", token });
    } catch (error: any) {
      next(error);
    }
  }

  static async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.authorization?.split(" ")[1] || "";
      await authService.logout(token);
      res.status(StatusCodes.OK).json({ message: "로그아웃 되었습니다." });
    } catch (error: any) {
      next(error);
    }
  }
}
