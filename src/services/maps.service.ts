import AppDataSource from '../data-source';
import { Maps } from '../entities/map.entity';
import { GetCalendarByIdParams } from '../types/params.type';
import { StatusCodes } from 'http-status-codes';

export class calendarServices {
    static async getMaps(userId: number) {
        try {
            const mapRepository = AppDataSource.getRepository(Maps);

            const maps = await mapRepository.find({
                where: { userId: userId },
            });

            return {
                message: '목적지 불러오기 완료',
                statusCode: StatusCodes.OK,
                destinations: maps,
            };
        } catch (error) {
            console.log(error);
            return {
                message: '목적지 불러오기 중 오류가 발생했습니다.',
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            };
        }
    }

    static async insertMaps(params: { [key: string]: any }, userId: number) {
        const mapRepository = AppDataSource.getRepository(Maps);
        try {
            // 기본적으로 userId를 추가
            params.userId = userId;
    
            // 엔티티에 맞는 데이터 포맷으로 변환
            const mapData = {
                place_id: params.place_id,
                name: params.name,
                latitude: params.latitude,
                longitude: params.longitude,
                rating: params.rating || null, // 평점이 없으면 null
                vicinity: params.vicinity || null, // 지역 정보가 없으면 null
                photos: params.photos || [], // 사진이 없으면 빈 배열
                userId: params.userId,
            };
    
            // Maps 엔티티에 저장
            const savedMap = await mapRepository.save(mapData);
            return {
                message: '목적지 저장 완료',
                statusCode: StatusCodes.OK,
                destination: savedMap,
            };
        } catch (error) {
            console.log(error);
            return {
                message: '목적지 저장 완료 중 오류가 발생했습니다.',
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            };
        }
    }
}
