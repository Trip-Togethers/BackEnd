import { Request, Response } from 'express';
import { calendarServices } from '../services/calendar.service';
import { GetCalendarByIdParams } from '../types/params.type';


export const getCalendar = async (req: Request<GetCalendarByIdParams>, res: Response) => {
    const calendar = await calendarServices.getCalendar(req.params);
    res.json(calendar);
};
