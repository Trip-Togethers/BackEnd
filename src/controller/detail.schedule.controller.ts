import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AppDataSource from "../data-source";
import { Schedule } from "../entities/schedule.entity";
import { Detaile } from "../entities/detail.schedule.entity";
import { insertDetailSchedule } from "../services/detail.schedul.service";
import {
  convertToUTC,
  findDetailedSchedules,
  generateFormattedDates,
  isDateInRange, 
} from "../utils/detail.schedule.util";
import { resetScheduleIds } from "./schedule.controller";
import { validateDetailTrip, validateEditDetailTrip, validateRemoveDetailTrip } from "../middleware/detail.schedule.validators";


// 세부 일정 조회
export const lookUpDetailTrips = async (req: Request, res: Response) => {
  const tripId = Number(req.params.tripId);

  try {
    // 스케줄 정보 조회
    const schedule = await getScheduleById(tripId);

    if (!schedule) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "존재하지 않는 일정입니다." });
      return;
    }

    // 날짜 계산에 필요한 시작일, 종료일 가져오기
    const startDate = new Date(schedule.start_date);
    const endDate = new Date(schedule.end_date);

    // 시작일과 종료일 사이의 날짜 생성
    const dateList = generateFormattedDates(startDate, endDate);

    // 세부 일정 조회
    const detailScheduleRepository = AppDataSource.getRepository(Detaile);
    const detailedSchedules = await detailScheduleRepository.find({
      where: {
        schedule: { id: tripId },
      },
    });

    const detailDate = findDetailedSchedules(dateList, detailedSchedules);

    res.status(StatusCodes.OK).json({
      scheduleDate: detailDate, // 날짜별 세부 일정
      date: detailedSchedules, // 모든 상세 일정 데이터 반환
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "사용자 생성 중 오류가 발생했습니다.",
    });
  }
}; 

// 세부 일정 추가
export const addDetailTrips = async (req: Request, res: Response) => {
  await Promise.all(validateDetailTrip.map((validate) => validate.run(req)));
  const tripId = Number(req.params.tripId);
  const { scheduleDate, scheduleTime, scheduleContent } = req.body;
  // 날짜를 UTC로 변환
  const utcScheduleDate = convertToUTC(scheduleDate);

  try {
    // 생성하기 전 날짜가 범위안에 들어오는지 확인
    const schedule = await getScheduleById(tripId);

    if (!schedule) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "존재하지 않는 일정입니다." });
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
        start: startDate,
      });
      return;
    }

    await insertDetailSchedule(
      tripId,
      utcScheduleDate,
      scheduleTime,
      scheduleContent
    );
    res.status(StatusCodes.OK).json({
      message: "일정이 성공적으로 생성되었습니다.",
    });
  } catch (error) {
    // 500 에러
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "사용자 생성 중 오류가 발생했습니다.",
    });
  }
}; 

// 세부 일정 수정
export const editDetailTrips = async (req: Request, res: Response) => {
  await Promise.all(validateEditDetailTrip.map((validate) => validate.run(req)));

  const tripId = Number(req.params.tripId);
  const { detailId, scheduleDate, scheduleTime, scheduleContent } = req.body;
  const utcScheduleDate = convertToUTC(scheduleDate);

  try {    
    const schedule = await getScheduleById(tripId);

    if (!schedule) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "해당 일정을 찾을 수 없습니다.",
      });
      return;
    }

    const startDate = new Date(schedule.start_date);
    const endDate = new Date(schedule.end_date);
    const inputDate = new Date(utcScheduleDate);

    // 날짜가 범위 안에 있는지 확인
    if (!isDateInRange(inputDate, startDate, endDate)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "시작일과 종료일 사이의 날짜를 입력해주세요.",
        inputDate: inputDate,
        start: startDate,
      });
      return;
    }

    const detailScheduleRepository = AppDataSource.getRepository(Detaile);
    const detailSchedules = await detailScheduleRepository.findOne({
      where: {
        id: detailId,
      },
    });

    if (!detailSchedules) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "세부 일정을 찾을 수 없습니다." });
      return;
    }

    if (scheduleDate) {
      detailSchedules.schedule_date = utcScheduleDate;
    }
    if (scheduleTime) {
      detailSchedules.schedule_time = scheduleTime;
    }
    if (scheduleContent) {
      detailSchedules.schedule_content = scheduleContent;
    }

    await detailScheduleRepository.save(detailSchedules);

    res.status(StatusCodes.OK).json({
      message: "세부 일정이 성공적으로 수정되었습니다.",
      id: detailSchedules.id,
      updatedDate: detailSchedules.schedule_date,
      updatedTime: detailSchedules.schedule_time,
      updatedContent: detailSchedules.schedule_content,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "세부 일정 수정 중 오류가 발생했습니다.",
    });
    return;
  }
}; 
// 세부 일정 삭제
export const removeDetailTrips = async (req: Request, res: Response) => {
  await Promise.all(validateRemoveDetailTrip.map((validate) => validate.run(req)));

  const tripId = Number(req.params.tripId);
  const { detailId } = req.body;

  try {
    const schedule = await getScheduleById(tripId);

    if (!schedule) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "해당 일정을 찾을 수 없습니다.",
      });
      return;
    }

    const detailScheduleRepository = AppDataSource.getRepository(Detaile);
    const detailSchedules = await detailScheduleRepository.findOne({
      where: {
        id: detailId,
      },
    });

    if (!detailSchedules) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `ID ${detailId}에 해당하는 세부 일정이 없습니다.` });
      return;
    }

    // 일정 삭제
    await detailScheduleRepository.remove(detailSchedules);
    await resetScheduleIds();
    res.status(StatusCodes.OK).json({
      message: "세부 일정이 성공적으로 삭제되었습니다."
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "세부 일정 삭제 중 오류가 발생했습니다.",
    });
    return;
  }
}; 

const getScheduleById = async (tripId: number): Promise<Schedule | null> => {
  const scheduleRepository = AppDataSource.getRepository(Schedule);
    const schedule = await scheduleRepository.findOne({
      where: {
        id: tripId,
      },
    });
    return schedule;
};