import express, { Request, Response } from 'express';
const router = express.Router();

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: Function) => Promise.resolve(fn(req, res, next));
import { getMaps, insertMaps } from '../controllers/maps.controller';

router
    .route('/destinations/:userId')
    .get(asyncHandler(getMaps))

    router
    .route('/destinations')
    .post(asyncHandler(insertMaps))

export default router;
