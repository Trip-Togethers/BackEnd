import { Request, Response } from 'express';
import { calendarServices } from '../services/maps.service';
import { GetCalendarByIdParams } from '../types/params.type';
import { StatusCodes } from 'http-status-codes';
import { validateInsertMap } from '../middleware/map.validators';
import { validationResult } from 'express-validator';

export const getMaps = async (req: Request<GetCalendarByIdParams>, res: Response) => {
    const map = await calendarServices.getMaps(req.params);
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

    const map = await calendarServices.insertMaps(req.body);
    res.json(map);
};
