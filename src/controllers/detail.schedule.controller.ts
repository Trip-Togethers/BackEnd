import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AppDataSource from "../data-source";
import { Detaile } from "../entities/detail.schedule.entity";
import { checkDateInRange, getScheduleByIdAndUserEmail, getUserByEmail, insertDetailSchedule } from "../services/detail.schedul.service";
import {
  convertToUTC,
  findDetailedSchedules,
  generateFormattedDates,
} from "../utils/detail.schedule.util";
import {
  validateAddTrip,
  validateEditDetailTrip,
  validateRemoveDetailTrip,
  validateTripId,
} from "../middleware/detail.schedule.validators";
import { Guest } from "../entities/guest.entity";
import { validationResult } from "express-validator";

// 세부 일정 조회
export const lookUpDetailTrips = async (req: Request, res: Response) => {
  await Promise.all(validateTripId.map((validator) => validator.run(req)));
  
    // 유효성 검사 결과 확인
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(StatusCodes.BAD_REQUEST).json({
        errors: errors.array(),
      });
      return;
    }
  const tripId = Number(req.params.tripId);
  const email = req.user?.email;

  if(!email) {
    res.status(StatusCodes.NOT_FOUND).json({
      message: "해당 이메일을 찾을 수 없습니다."
    })
    return;
  }

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "사용자를 찾을 수 없습니다." });
      return;
    }

    // 초대자 또는 동행자 여부에 따라 일정 조회
    let schedule;
    const guestRepository = AppDataSource.getRepository(Guest);

    // 동행자가 초대된 일정이 있는지 확인
    const guest = await guestRepository.findOne({
      where: { email: email, schedule: { id: tripId } },
      relations: ["schedule"],
    });

    if (guest) {
      // 동행자라면, 해당 동행자가 초대받은 일정 조회
      schedule = guest.schedule;
    } else {
      // 초대자라면, 본인이 소유한 일정 조회
      schedule = await getScheduleByIdAndUserEmail(tripId, email);
    }

    if (!schedule) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "일정을 찾을 수 없습니다" });
      return;
    }

    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);
    const dateList = generateFormattedDates(startDate, endDate);

    const detailScheduleRepository = AppDataSource.getRepository(Detaile);
    const detailedSchedules = await detailScheduleRepository.find({
      where: { schedule: { id: tripId } },
    });

    const detailDate = findDetailedSchedules(dateList, detailedSchedules);

    res.status(StatusCodes.OK).json({
      scheduleDate: detailDate,
      date: detailedSchedules,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "서버 오류" });
  }
};

// 세부 일정 추가
export const addDetailTrips = async (req: Request, res: Response) => {
  await Promise.all(validateAddTrip.map((validate) => validate.run(req)));

  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(StatusCodes.BAD_REQUEST).json({
        errors: errors.array(),
      });
      return;
    }

  const tripId = Number(req.params.tripId);
  const { scheduleDate, scheduleTime, scheduleContent } = req.body;
  const utcScheduleDate = convertToUTC(scheduleDate);
  const email = req.user?.email;
  if(!email) {
    res.status(StatusCodes.NOT_FOUND).json({
      message: "해당 이메일을 찾을 수 없습니다."
    })
    return;
  }

  try { 
    const user = await getUserByEmail(email);

    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "사용자를 찾을 수 없습니다." });
      return;
    }
    

    // 초대자 또는 동행자 여부에 따라 일정 조회
    let schedule;
    const guestRepository = AppDataSource.getRepository(Guest);

    // 동행자가 초대된 일정이 있는지 확인
    const guest = await guestRepository.findOne({
      where: { email: email, schedule: { id: tripId } },
      relations: ["schedule"],
    });

    if (guest) {
      // 동행자라면, 해당 동행자가 초대받은 일정 조회
      schedule = guest.schedule;
    } else {
      // 초대자라면, 본인이 소유한 일정 조회
      schedule = await getScheduleByIdAndUserEmail(tripId, email);
    }

    if (!schedule) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "일정을 찾을 수 없습니다" });
      return;
    }

    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);
    const inputDate = new Date(utcScheduleDate);

    if (!checkDateInRange(inputDate, startDate, endDate)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "시작일과 종료일 사이의 날짜를 입력해주세요.",
        inputDate: inputDate,
        start: startDate,
      });
      return;
    }

    await insertDetailSchedule(tripId, utcScheduleDate, scheduleTime, scheduleContent);

    res.status(StatusCodes.OK).json({ message: "일정이 성공적으로 생성되었습니다." });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "서버 오류" });
  }
};

// 세부 일정 수정
export const editDetailTrips = async (req: Request, res: Response) => {
  await Promise.all(validateEditDetailTrip.map((validate) => validate.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(StatusCodes.BAD_REQUEST).json({
      errors: errors.array(),
    });
    return;
  }

  const tripId = Number(req.params.tripId);
  const activityId = Number(req.params.activityId);
  const { scheduleDate, scheduleTime, scheduleContent } = req.body;
  const utcScheduleDate = convertToUTC(scheduleDate);
  const email = req.user?.email;
  if(!email) {
    res.status(StatusCodes.NOT_FOUND).json({
      message: "해당 이메일을 찾을 수 없습니다."
    })
    return;
  }

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "사용자를 찾을 수 없습니다." });
      return;
    }

    // 초대자 또는 동행자 여부에 따라 일정 조회
    let schedule;
    const guestRepository = AppDataSource.getRepository(Guest);

    // 동행자가 초대된 일정이 있는지 확인
    const guest = await guestRepository.findOne({
      where: { email: email, schedule: { id: tripId } },
      relations: ["schedule"],
    });

    if (guest) {
      // 동행자라면, 해당 동행자가 초대받은 일정 조회
      schedule = guest.schedule;
    } else {
      // 초대자라면, 본인이 소유한 일정 조회
      schedule = await getScheduleByIdAndUserEmail(tripId, email);
    }

    if (!schedule) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "일정을 찾을 수 없습니다" });
      return;
    }

    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);
    const inputDate = new Date(utcScheduleDate);

    if (!checkDateInRange(inputDate, startDate, endDate)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "시작일과 종료일 사이의 날짜를 입력해주세요.",
        inputDate: inputDate,
        start: startDate,
      });
      return;
    }

    const detailScheduleRepository = AppDataSource.getRepository(Detaile);
    const detailSchedules = await detailScheduleRepository.findOne({ where: { id: activityId } });

    if (!detailSchedules) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "세부 일정을 찾을 수 없습니다." });
      return;
    }

    if (scheduleDate) {
      detailSchedules.scheduleDate = utcScheduleDate;
    }
    if (scheduleTime) {
      detailSchedules.scheduleTime = scheduleTime;
    }
    if (scheduleContent) {
      detailSchedules.scheduleContent = scheduleContent;
    }

    await detailScheduleRepository.save(detailSchedules);

    res.status(StatusCodes.OK).json({
      message: "세부 일정이 성공적으로 수정되었습니다.",
      id: detailSchedules.id,
      updatedDate: detailSchedules.scheduleDate,
      updatedTime: detailSchedules.scheduleTime,
      updatedContent: detailSchedules.scheduleContent,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "서버 오류" });
  }
};

// 세부 일정 삭제
export const removeDetailTrips = async (req: Request, res: Response) => {
  await Promise.all(validateRemoveDetailTrip.map((validate) => validate.run(req)));

  const tripId = Number(req.params.tripId);  
  const activityId = Number(req.params.activityId);
  const email = req.user?.email;
  if(!email) {
    res.status(StatusCodes.NOT_FOUND).json({
      message: "해당 이메일을 찾을 수 없습니다."
    })
    return;
  }

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "사용자를 찾을 수 없습니다." });
      return;
    }

    // 초대자 또는 동행자 여부에 따라 일정 조회
    let schedule;
    const guestRepository = AppDataSource.getRepository(Guest);

    // 동행자가 초대된 일정이 있는지 확인
    const guest = await guestRepository.findOne({
      where: { email: email, schedule: { id: tripId } },
      relations: ["schedule"],
    });

    if (guest) {
      // 동행자라면, 해당 동행자가 초대받은 일정 조회
      schedule = guest.schedule;
    } else {
      // 초대자라면, 본인이 소유한 일정 조회
      schedule = await getScheduleByIdAndUserEmail(tripId, email);
    }

    if (!schedule) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "일정을 찾을 수 없습니다" });
      return;
    }

    const detailScheduleRepository = AppDataSource.getRepository(Detaile);
    const detailSchedules = await detailScheduleRepository.findOne({ where: { id: activityId } });

    if (!detailSchedules) {
      res.status(StatusCodes.NOT_FOUND).json({ message: `ID ${activityId}에 해당하는 세부 일정이 없습니다.` });
      return;
    }

    await detailScheduleRepository.remove(detailSchedules);

    res.status(StatusCodes.OK).json({ message: "세부 일정이 성공적으로 삭제되었습니다." });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "서버 오류" });
  }
};