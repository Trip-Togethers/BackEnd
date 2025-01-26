import express, { Request, Response } from 'express';
const router = express.Router();

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: Function) => Promise.resolve(fn(req, res, next));
import { getCalendar } from '../controller/calendar.controller';

router
    .route('/:user_id')
    .get(asyncHandler(getCalendar))

export default router;
