import express, { Request, Response } from 'express';
const router = express.Router();

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: Function) => Promise.resolve(fn(req, res, next));
import { deleteMaps, getMaps, insertMaps } from '../controllers/maps.controller';
import { authMiddleware } from "../middleware/auth.middleware";

router
    .route('/destinations')
    .get(authMiddleware, asyncHandler(getMaps))
    .post(authMiddleware, asyncHandler(insertMaps))

router
    .route('/destinations/:placeId')
    .delete(authMiddleware, asyncHandler(deleteMaps));

export default router;
