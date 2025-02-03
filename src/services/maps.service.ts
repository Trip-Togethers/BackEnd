import { StatusCodes } from "http-status-codes";
import AppDataSource from '../data-source';
import { Maps } from '../entities/map.entity';
import { GetCalendarByIdParams } from '../types/params.type';

export class calendarServices {
    static async getMaps(params: GetCalendarByIdParams) {
        const userId = Number(params.userId);
        const mapRepository = AppDataSource.getRepository(Maps);

        const maps = await mapRepository.find({
            where: { userId: userId },
        });
        
        return {
            message: '목적지 불러오기 완료',
            statusCode: StatusCodes.OK,
            destinations: maps,
        };
    }

    static async insertMaps(params: { [key: string]: any }) {
        const mapRepository = AppDataSource.getRepository(Maps);
        try {
            const savedMap = await mapRepository.save(params);
            return {
                message: '목적지 저장 완료',
                statusCode: StatusCodes.OK,
                destination: savedMap,
            };
        } catch (error) {
            return {
                message: '목적지 저장 완료 중 오류가 발생했습니다.',
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            };
        }
    }
}
