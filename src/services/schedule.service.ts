import AppDataSource from "../data-source";
import { Schedule } from "../entities/schedule.entity";

// 일정 생성
export const insertSchedule = async (
  title: string,
  destination: string,
  start_date: Date,
  end_date: Date,
  email: string, // id를 받아와서 저장해도 ok
  photo_url: string
) => {
  const scheduleRepository = AppDataSource.getRepository(Schedule);

  // 새 일정 객체 생성
  const newSchedule = new Schedule();
  newSchedule.title = title;
  newSchedule.destination = destination;
  newSchedule.start_date = start_date;
  newSchedule.end_date = end_date;
  newSchedule.user = email;
  newSchedule.photo_url = photo_url;

  // 데이터 베이스에 저장
  await scheduleRepository.save(newSchedule);
  console.log("Schedule has been saved");
};
