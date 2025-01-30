import { Request, Response } from 'express';
import { calendarServices } from '../services/maps.service';
import { GetCalendarByIdParams } from '../types/params.type';


export const getMaps = async (req: Request<GetCalendarByIdParams>, res: Response) => {
    const map = await calendarServices.getMaps(req.params);
    res.json(map);
};

export const insertMaps = async (req: Request, res: Response) => {

    if (!req.body.name || !req.body.address_name || !req.body.latitude || !req.body.longitude) return res.status(400).json({ message: "유효하지 않은 데이터입니다." });

    const map = await calendarServices.insertMaps(req.body);
    res.json(map);
};