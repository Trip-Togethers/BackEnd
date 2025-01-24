import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AppDataSource from "../data-source";
import { Schedule } from "../entities/schedule.entity";
import { Detaile } from "../entities/detail.schedule.entity";
import { insertDetailSchedule } from "../services/detail.schedul.service";
import { body } from "express-validator";
import {
  convertToUTC,
  findDetailedSchedules,
  generateFormattedDates,
  isDateInRange,
} from "../utils/detail.schedule.util";

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
    const detaList = generateFormattedDates(startDate, endDate);

    // 세부 일정 조회
    const detailScheduleRepository = AppDataSource.getRepository(Detaile);
    const detailedSchedule = await detailScheduleRepository.find({
      where: {
        schedule: { id: scheduleId },
      },
    });

    const detailDate = findDetailedSchedules(detaList, detailedSchedule);

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
  // 날짜 범위는 어떻게 정할까..
  await body("scheduleDate")
    .notEmpty()
    .withMessage("일정 날짜를 입력해주세요.")
    .isDate()
    .withMessage("올바른 날짜 형식(YYYY-MM-DD)으로 입력해주세요.")
    .run(req);
  await body("scheduleTime")
    .notEmpty()
    .withMessage("일정 시간을 입력해주세요.")
    .run(req);
  await body("scheduleContent")
    .notEmpty()
    .withMessage("일정 내용을 입력해주세요.")
    .isLength({ min: 2 })
    .withMessage("내용은 2글자 이상으로 입력해주세요.")
    .run(req);
  const scheduleId = Number(req.params.tripId);
  const { scheduleDate, scheduleTime, scheduleContent } = req.body;
  // 날짜를 UTC로 변환
  const utcScheduleDate = convertToUTC(scheduleDate);

  try {
    // 생성하기 전 날짜가 범위안에 들어오는지 확인
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
    const inputDate = new Date(utcScheduleDate);

    if (!isDateInRange(inputDate, startDate, endDate)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "시작일과 종료일 사이의 날짜를 입력해주세요.",
        inputDate: inputDate,
        start: startDate
      });
      return;
    }

    await insertDetailSchedule(
      scheduleId,
      utcScheduleDate,
      scheduleTime,
      scheduleContent
    );
    res.status(StatusCodes.OK).json({
      message: "Schedule created successfully",
    });
  } catch (error) {
    // 500 에러
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error creating user",
      error,
    });
  }
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
