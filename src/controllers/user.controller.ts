import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { StatusCodes } from "http-status-codes";
import { uploadParams } from "../middleware/multer.config";

const userService = new UserService();

export class UserController {
  // 프로필 조회
  static async getUserProfile(req: Request, res: Response): Promise<void> {
    const userId = Number(req.params.user_id);
    const loggedInUserId = (req as any).user.userId;

    const isValid = await UserController.findUser(userId, loggedInUserId);
    if (!isValid) {
      res.status(StatusCodes.FORBIDDEN).json({
        message: "다른 사용자의 정보를 볼 수 없습니다.",
      });
      return;
    }

    try {
      const user = await userService.getUserProfile(userId); // 서비스에서 사용자 정보 가져오기

      if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({
          message: "사용자를 찾을 수 없습니다.",
        });
        return;
      }

      res.status(StatusCodes.OK).json({
        message: "사용자 정보 조회 성공",
        user: {
          nickname: user.nickname,
          email: user.email,
          profile_picture: user.profile_picture, // 이미지 URL이 있을 경우 반환
        },
      });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "사용자 정보를 가져오는 중 오류가 발생했습니다.",
      });
    }
  }
  // 프로필 수정
  static async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = Number(req.params.user_id);
    const loggedInUserId = (req as any).user.userId;

    const isValid = await UserController.findUser(userId, loggedInUserId);
    if (!isValid) {
      res.status(StatusCodes.FORBIDDEN).json({
        message: "다른 사용자의 정보를 볼 수 없습니다.",
      });
      return;
    }
    
    try {
      let imageUrl;

      if (req.file?.path) {
        try {
          imageUrl = await uploadParams(req.file?.path, req.file?.filename);
        } catch (error) {
          console.error("파일 업로드 실패:", error);
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "파일 업로드 오류",
            error,
          });
          return;
        }
      }

      const { nickname, email, newPassword } = req.body;

      await userService.updateProfile(
        userId,
        nickname,
        email,
        newPassword,
        imageUrl
      );

      res.status(StatusCodes.OK).json({ message: "프로필 수정 완료" });
    } catch (error: any) {
      console.error(error);
      res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
  }

  // 메뉴
  static async getUserMenu(req: Request, res: Response): Promise<void> {
    try {
      const userId = Number(req.params.user_id);
      const menu = await userService.getUserMenu(userId);

      res.status(StatusCodes.OK).json({ menu });
    } catch (error: any) {
      console.error(error);
      res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
  }

  // 탈퇴
  static async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const userId = Number(req.params.user_id);
      await userService.deleteAccount(userId);

      res
        .status(StatusCodes.OK)
        .json({ message: "회원 탈퇴가 완료되었습니다." });
    } catch (error: any) {
      console.error(error);
      res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
  }

  // 유저 검증 함수
static async findUser(userId: number, loggedInUserId: number): Promise<boolean> {
  if (userId !== loggedInUserId) {
    return false; // 다른 사용자의 정보는 볼 수 없도록 false 반환
  }

  if (isNaN(userId)) {
    return false; // 잘못된 사용자 ID 처리
  }

  return true; // 유효한 ID일 경우 true 반환
}
}
