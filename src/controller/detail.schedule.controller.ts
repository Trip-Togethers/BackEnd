import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AppDataSource from "../data-source";
import { Schedule } from "../entities/schedule.entity";
import { Detaile } from "../entities/detail.schedule.entity";
import { isSameDay, parseISO } from "date-fns";

// 세부 일정 조회
export const allDetailTrips = async (req: Request, res: Response) => {
  const scheduleId = Number(req.params.tripId);

  try {
    // 스케줄 정보 조회
  const scheduleRepository = AppDataSource.getRepository(Schedule);
  const schedule = await scheduleRepository.findOne({
    where: {
      id: scheduleId,
    },
  });

  if (!schedule) {
    res.status(StatusCodes.NOT_FOUND).json({ message: "Trip not found." });
    return;
  }

  // 날짜 계산에 필요한 시작일, 종료일 가져오기
  const startDate = new Date(schedule.start_date);
  const endDate = new Date(schedule.end_date);

  // 시작일과 종료일 사이의 날짜 생성
  const dates = generateDatesBetween(startDate, endDate);
  const detaList: string[] = [];

  for (let i = 0; i < dates.length; i++) {
    const formmat_date = dates[i].toISOString().split("T")[0];
    detaList.push(formmat_date);
  }

  // 세부 일정 조회
  const detailScheduleRepository = AppDataSource.getRepository(Detaile);
  const detailedSchedule = await detailScheduleRepository.find({
    where: {
      schedule: { id: scheduleId },
    },
  });

  const detailDate = detaList.map((currentDate) => {
    const currentDateObj = parseISO(`${currentDate}T00:00:00`);
    const matchingDates = detailedSchedule.filter((details) => {
      const scheduleDate = details.schedule_date;
      return isSameDay(scheduleDate, currentDateObj);
    });

    return {
      scheduleDate: currentDate, // 날짜
      currentDate:
        matchingDates.length > 0 ? matchingDates : "No detail available", // 해당 날짜의 상세 일정들
    };
  });

  res.status(StatusCodes.OK).json({
    scheduleDate: detailDate, // 날짜별 세부 일정
    date: detailedSchedule, // 모든 상세 일정 데이터 반환
  });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error creating user",
      error,
    });
  }
};

// 세부 일정 추가
export const addDetailTrips = async (req: Request, res: Response) => {
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
