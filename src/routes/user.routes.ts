import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.put('/:user_id', authMiddleware, UserController.updateProfile);
router.get('/:user_id/menu', authMiddleware, UserController.getUserMenu);
router.delete('/:user_id', authMiddleware, UserController.deleteAccount);

export default router;
