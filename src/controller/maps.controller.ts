import { Request, Response } from 'express';
import { calendarServices } from '../services/maps.service';
import { GetCalendarByIdParams } from '../types/params.type';


export const getMaps = async (req: Request<GetCalendarByIdParams>, res: Response) => {
    const map = await calendarServices.getMaps(req.params);
    res.json(map);
};

export const insertMaps = async (req: Request, res: Response) => {
    const map = await calendarServices.insertMaps(req.body);
    res.json(map);
};