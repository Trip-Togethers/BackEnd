import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';

const router = Router();

router.put('/nickname/:userId', ProfileController.updateNickname); // 닉네임 변경
router.put('/password/:userId', ProfileController.updatePassword); // 비밀번호 변경
router.delete('/delete/:userId', ProfileController.deleteAccount); // 회원 탈퇴

export default router;
