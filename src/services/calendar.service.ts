import { AppDataSource } from '../data-source';
import { Trips, TripDetail, Participant } from '../entities/calendar.entity';
import { GetCalendarByIdParams } from '../types/params.type';

export class calendarServices {
    static async getCalendar(params: GetCalendarByIdParams) {
        const user_id = Number(params.user_id);

        const calendarRepository = AppDataSource.getRepository(Participant);
        const tripDetailRepository = AppDataSource.getRepository(TripDetail);

        const participants = await calendarRepository.find({
            relations: ['tripId'],
            where: { user_id: user_id },
        });

        const trips = await Promise.all(
            participants.map(async (participant) => {
                const trip = participant.tripId;

                const tripDetails = await tripDetailRepository.find({
                    where: { trip_id: trip.trip_id },
                });

                const schedules = tripDetails.map((detail) => ({
                    title: detail.schedule_title,
                    date: detail.schedule_time,
                }));

                return {
                    id: trip.trip_id,
                    title: trip.title,
                    destination: trip.destination,
                    photo_url: trip.photo_url,
                    start_date: trip.start_date,
                    end_date: trip.end_date,
                    schedules: schedules,
                };
            })
        );

        return {
            success: true,
            message: '일정 정보 불러오기 완료',
            trips: trips,
        };
    }
}
