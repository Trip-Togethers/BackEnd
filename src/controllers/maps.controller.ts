import { Request, Response } from 'express';
import { calendarServices } from '../services/maps.service';
import { GetCalendarByIdParams } from '../types/params.type';
import { StatusCodes } from 'http-status-codes';
import { validateInsertMap } from '../middleware/map.validators';
import { validationResult } from 'express-validator';

export const getMaps = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "사용자를 찾을 수 없습니다." });
    }
    
    const map = await calendarServices.getMaps(userId);
    res.json(map);
};

export const insertMaps = async (req: Request, res: Response) => {
    await Promise.all(validateInsertMap.map((validate) => validate.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(StatusCodes.BAD_REQUEST).json({
            errors: errors.array(),
        });
        return;
    }

    const userId = req.user?.userId;
    if (!userId) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "사용자를 찾을 수 없습니다." });
      }

    const map = await calendarServices.insertMaps(req.body, userId);
    res.json(map);
};
