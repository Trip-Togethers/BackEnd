import express, { Request, Response } from 'express';
const router = express.Router();

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: Function) => Promise.resolve(fn(req, res, next));
import { getMaps, insertMaps } from '../controllers/maps.controller';
import { authMiddleware } from "../middleware/auth.middleware";

router
    .route('/destinations')
    .get(authMiddleware, asyncHandler(getMaps))
    .post(authMiddleware, asyncHandler(insertMaps))

export default router;
