import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { insertSchedule } from "../services/schedule.service";
import AppDataSource from "../data-source";
import { Schedule } from "../entities/schedule.entity";
import { validationResult } from "express-validator";
import { uploadParams } from "../middleware/multer.config";
import {
  validateAddTrip,
  validateLookupTrips,
} from "../middleware/schedule.validators";
import { error } from "console";

// 여행 일정 조회
export const loopUpTrips = async (req: Request, res: Response) => {
  await Promise.all(validateLookupTrips.map((validator) => validator.run(req)));

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    return;
  }
  const { email } = req.body;

  try {
    // 이메일에 해당하는 일정 조회
    const scheduleRepository = AppDataSource.getRepository(Schedule);
    const user = await scheduleRepository.find({
      where: { user: email },
    });

    if (!user || user.length === 0) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "해당 이메일로 등록된 일정이 없습니다.",
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      schedules: user,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "일정을 찾을 수 없습니다.",
      error,
    });
  }
};

// 여행 일정 추가
export const addTrips = async (req: Request, res: Response) => {
  // express-validator로 요청 데이터 검증
  await Promise.all(validateAddTrip.map((validator) => validator.run(req)));

  // 유효성 검사 결과 확인
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(StatusCodes.BAD_REQUEST).json({
      errors: errors.array(),
    });
    return;
  }

  // 제목, 목적지, 기간 (시작일, 종료일)
  const { title, destination, startDate, endDate, email } = req.body;
  const photoFilePath = handleFileUpload(req);
  const photoUrl = photoFilePath ? photoFilePath : "";

  if (photoFilePath && req.file?.path) {
    try {
      await uploadParams(req.file?.path, req.file?.filename);
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "파일 업로드 오류",
        error,
      });
      return;
    }
  }

  try {
    await insertSchedule(
      title,
      destination,
      startDate,
      endDate,
      email,
      photoUrl
    );
    res.status(StatusCodes.OK).json({
      message: "일정이 성공적으로 생성되었습니다",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "사용자 생성 오류",
      error,
    });
  }
};

// 여행 일정 삭제
export const removeTrips = async (req: Request, res: Response) => {
  const tripId = Number(req.params.tripId);

  if (!tripId || isNaN(tripId)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "삭제할 일정 ID를 올바르게 제공해주세요.",
    });
    return;
  }

  try {
    const scheduleRepository = AppDataSource.getRepository(Schedule);
    const schedule = await scheduleRepository.findOne({
      where: {
        id: tripId,
      },
    });

    if (!schedule) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "일정을 찾을 수 없습니다",
      });
      return;
    }

    try {
      // 일정 삭제
      await scheduleRepository.remove(schedule);
      res.status(StatusCodes.OK).json({
        message: "일정이 성공적으로 삭제되었습니다.",
      });
    } catch (err) {
      const error = err as Error;
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "일정 삭제 중 오류가 발생했습니다.",
        error: error.message,
      });
    }
  } catch (findError) {
    console.error("일정 조회 중 오류 발생:", findError);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "일정 조회 중 오류가 발생했습니다.",
      error: error,
    });
    return;
  }
};

// 경로 리턴해주는 함수
const handleFileUpload = (req: Request): string | null => {
  if (!req.file) {
    return null;
  }
  return `/uploads/${req.file.filename}`;
};
