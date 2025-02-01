import AppDataSource from "../data-source";
import { Detaile } from "../entities/detail.schedule.entity";
import { Schedule } from "../entities/schedule.entity";
import { User } from "../entities/user.entity";
import { isDateInRange } from "../utils/detail.schedule.util";

// 일정 생성
export const insertDetailSchedule = async (
  scheduleId: number,
  scheduleDate: Date,
  scheduleTime: string,
  scheduleContent: string
) => {
  const scheduleRepository = AppDataSource.getRepository(Schedule);
  const schedule = await scheduleRepository.findOne({
    where: {
      id: scheduleId,
    }, 
  });

  const detailScheduleRepository = AppDataSource.getRepository(Detaile);

  // schedule이 존재하지 않으면 예외 처리
  if (!schedule) {
    throw new Error("Schedule not found");
  }

  // 새 일정 객체 생성
  const newDetailSchedule = new Detaile(); 
  newDetailSchedule.schedule = schedule;
  newDetailSchedule.scheduleDate = scheduleDate;
  newDetailSchedule.scheduleTime = scheduleTime;
  newDetailSchedule.scheduleContent = scheduleContent;

  // 데이터 베이스에 저장
  await detailScheduleRepository.save(newDetailSchedule);
  console.log("Schedule has been saved");
};

// 사용자 조회
export const getUserByEmail = async (email: string) => {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({
    where: { email: email },
  });

  return user;
};

// 일정 조회
export const getScheduleByIdAndUserEmail = async (tripId: number, email: string) => {
  const scheduleRepository = AppDataSource.getRepository(Schedule);
  const schedule = await scheduleRepository.findOne({
    where: {
      id: tripId,
      user: { email: email },
    },
    relations: ["user"],
  });

  return schedule;
};

// 날짜 범위 체크
export const checkDateInRange = (inputDate: Date, startDate: Date, endDate: Date) => {
  return isDateInRange(inputDate, startDate, endDate);
};
