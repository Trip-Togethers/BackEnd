import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { registerValidation } from "../middleware/validation.middleware";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/multer.config";

const router = Router();

// 회원가입
router.post("/register", registerValidation, AuthController.register);

// 이메일 인증
router.post("/verify-email", AuthController.verifyEmail);

// 로그인
router.post("/login", AuthController.login);

// 로그아웃
router.delete("/logout", AuthController.logout);

router.get("/:userId", authMiddleware, UserController.getUserProfile);

router.put(
  "/:userId",
  upload.single("image"),
  authMiddleware,
  UserController.updateProfile
);

router.get("/:userId/menu", authMiddleware, UserController.getUserMenu);

router.delete("/:userId", authMiddleware, UserController.deleteAccount);

export default router;
