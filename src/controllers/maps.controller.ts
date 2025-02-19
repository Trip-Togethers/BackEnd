import { Request, Response } from 'express';
import { calendarServices } from '../services/maps.service';
import { GetCalendarByIdParams } from '../types/params.type';
import { StatusCodes } from 'http-status-codes';
import { validateInsertMap } from '../middleware/map.validators';
import { validationResult } from 'express-validator';
import AppDataSource from '../data-source';
import { Maps } from '../entities/map.entity';

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

export const deleteMaps = async (req: Request, res: Response) => {
    const { place_id } = req.params;
  const mapRepository = AppDataSource.getRepository(Maps);

  try {
    const map = await mapRepository.findOne({ where: { place_id } });
    if (!map) {
      return res.status(404).json({ message: '목적지를 찾을 수 없습니다.' });
    }

    await mapRepository.remove(map);
    res.status(200).json({ message: '목적지 삭제 완료' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '목적지 삭제 중 오류가 발생했습니다.' });
  }
};