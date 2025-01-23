import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AppDataSource from "../data-source";
import { Schedule } from "../entities/schedule.entity";
import { Detaile } from "../entities/detail.schedule.entity";

// 세부 일정 조회
export const allDetailTrips = async (req: Request, res: Response) => {
  const scheduleId = Number(req.params.tripsId);

  try {
    // TODO: 여행 일정 계산 (17~19일 여행 기간이라면, 17, 18, 19 따로 저장하기)
    const scheduleRepository = AppDataSource.getRepository(Schedule);
    const detailSchedule = await scheduleRepository.findOne({
      select: ["id", "start_date", "end_date"],
      where: {
        id: scheduleId,
      },
    });

    if (!detailSchedule) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Trip not found." });
      return;
    }

    const startDate = new Date(detailSchedule.start_date);
    const endDate = new Date(detailSchedule.end_date);

     // 시작일과 종료일 사이의 날짜 생성
    const dates = generateDatesBetween(startDate, endDate);
    const deta_list: string[] = [];

    for (let i = 0; i < dates.length; i++) {
      const formmat_date = dates[i].toISOString().split("T")[0];
      deta_list.push(formmat_date);
    }

    //TODO: 개별 날짜에 저장된 세부 일정 조회 (17, 18, 19일 각각 해당하는 일정 확인)
    // 각 날짜에 맞는 세부 일정 조회
    const detailScheduleRepository = AppDataSource.getRepository(Detaile);
    const detailSchedules = await detailScheduleRepository.find({
      where: {
        schedule: detailSchedule
      }
    });

    // 날짜별 세부 일정 정리
    const detailedScheduleByDate: { [key: string]: unknown[] } = {};
    detailSchedules.forEach((schedule) => {
      const date_key = schedule.schedule_date.toISOString().split("T")[0];
      if (!detailedScheduleByDate[date_key]) {
        detailedScheduleByDate[date_key] = [];
      }
      detailedScheduleByDate[date_key].push(schedule);
    });

    res.status(StatusCodes.OK).json({
      message: detailSchedule,
      day: deta_list, // 날짜 목록
      detailedScheduleByDate, // 날짜별 세부 일정
    });
  } catch (error) {
    console.error("Error details:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Error fetching schedule." });
  }
};

// 세부 일정 추가
export const addDetailTrips = (req: Request, res: Response) => {
  console.log("세부 일정 추가");
  res.status(StatusCodes.OK).json({
    message: "세부 일정 추가",
  });
};
// 세부 일정 수정
export const editDetailTrips = (req: Request, res: Response) => {
  console.log("세부 일정 수정");
  res.status(StatusCodes.OK).json({
    message: "세부 일정 수정",
  });
};
// 세부 일정 삭제
export const removeDetailTrips = (req: Request, res: Response) => {
  console.log("세부 일정 삭제");
  res.status(StatusCodes.OK).json({
    message: "세부 일정 삭제",
  });
};

// 날짜 생성 함수
const generateDatesBetween = (start_date: Date, end_date: Date): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(start_date);

  while (currentDate <= end_date) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1); // 하루를 더함
  }

  return dates;
};
