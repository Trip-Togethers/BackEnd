import AppDataSource from "../data-source";
import { Schedule } from "../entities/schedule.entity";
import { User } from "../entities/user.entity";

// 일정 생성
export const insertSchedule = async (
  title: string,
  destination: string,
  startDate: Date,
  endDate: Date,
  email: string,
  photoUrl: string,
  owner: number
) => { 
  const scheduleRepository = AppDataSource.getRepository(Schedule);
  const userRepository = AppDataSource.getRepository(User);

  // 유저를 이메일로 찾아서 저장
  const user = await userRepository.findOne({
    where: { email: email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // 새 일정 객체 생성
  const newSchedule = new Schedule();
  newSchedule.title = title;
  newSchedule.destination = destination;
  newSchedule.startDate = startDate;
  newSchedule.endDate = endDate;
  newSchedule.user = user;
  newSchedule.photoUrl = photoUrl;
  newSchedule.owner = owner

  // 데이터 베이스에 저장
  await scheduleRepository.save(newSchedule);
  console.log("Schedule has been saved");
};
