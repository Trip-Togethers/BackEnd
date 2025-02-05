import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
const router = express.Router();

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: Function) => Promise.resolve(fn(req, res, next));
import { getCalendar } from '../controllers/calendar.controller';

router
    .route('/')
    .get(authMiddleware, asyncHandler(getCalendar))

export default router;
