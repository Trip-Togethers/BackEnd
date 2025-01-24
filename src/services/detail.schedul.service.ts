import AppDataSource from "../data-source";
import { Detaile } from "../entities/detail.schedule.entity";
import { Schedule } from "../entities/schedule.entity";

// 일정 생성
export const insertDetailSchedule = async (
  schedule_id: number,
  schedule_date: Date,
  schedule_time: string,
  schedule_content: string
) => {
  const scheduleRepository = AppDataSource.getRepository(Schedule);
  const schedule = await scheduleRepository.findOne({
    where: {
      id: schedule_id
    }
  })

  const detailScheduleRepository = AppDataSource.getRepository(Detaile);

  // schedule이 존재하지 않으면 예외 처리
  if (!schedule) {
    throw new Error("Schedule not found");
  }

  // 새 일정 객체 생성
  const newDetailSchedule = new Detaile();
  newDetailSchedule.schedule = schedule;
  newDetailSchedule.schedule_date = schedule_date;
  newDetailSchedule.schedule_time = schedule_time;
  newDetailSchedule.schedule_content = schedule_content;

  // 데이터 베이스에 저장
  await detailScheduleRepository.save(newDetailSchedule);
  console.log("Schedule has been saved");
};
