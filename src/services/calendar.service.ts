import AppDataSource from "../data-source";
import { Guest } from "../entities/guest.entity";
import { Schedule } from "../entities/schedule.entity";

export class calendarServices {
  static async getCalendar(userId: number) {
    
    try {
      // 초대자일 경우 (일정의 owner)
      const ownerSchedules = await AppDataSource.getRepository(Schedule).find({
        where: { owner: userId },
        relations: ["details"], // 동행자 정보도 가져오기
      });

      // 동행자일 경우 (guests에 본인 이메일이 포함된 일정)
      const guestSchedules = await AppDataSource.getRepository(Guest).find({
        where: { user_id: userId },
        relations: ["schedule"],
      });

      // 초대자 일정과 동행자 일정 합치기
      const allSchedules = [
        ...ownerSchedules, // 초대자의 일정
        ...guestSchedules.map((guest) => guest.schedule), // 동행자의 일정
      ];

      return allSchedules;
    } catch (error) {
      console.error(error);
      throw new Error("일정 데이터를 가져오는 중 오류가 발생했습니다.");
    }
  }
}
