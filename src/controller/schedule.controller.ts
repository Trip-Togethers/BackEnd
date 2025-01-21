import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import { insertSchedule } from "../services/schedule.service";
import AppDataSource from "../data-source";
import { Schedule } from "../entities/schedule.entity";

// 여행 일정 조회
export const allTrips = async (req: Request, res: Response) => {
  const { email } = req.body;

  // 이메일에 해당하는 일정 조회
  const scheduleRepository = AppDataSource.getRepository(Schedule);
  const user = await scheduleRepository.find({
    where: { user: email }
  });

  if (!user) {
    throw new Error("User not found");
  }

  res.status(StatusCodes.OK).json({
    schedules: user
  });
};

// 여행 일정 추가
export const addTrips = async (req: Request, res: Response) => {
  // 대표 이미지 선택
  // 제목, 목적지, 기간 (시작일, 종료일)
  const { title, destination, start_date, end_date , email } = req.body;
  if (!title || !start_date || !end_date || !destination || email) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "제목과 시작일, 종료일을 모두 입력해 주세요",
    });
    return;
  } else {
    try {
      await insertSchedule(
        title,
        destination,
        start_date,
        end_date,
        email
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
  }
};

// 여행 일정 삭제
export const removeTrips = async (req: Request, res: Response) => {
  const { trip_id } = req.params;

  if (!trip_id || isNaN(Number(trip_id))) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "삭제할 일정 ID를 올바르게 제공해주세요.",
    });
    return;
  }

  try {
    const scheduleRepository = AppDataSource.getRepository(Schedule);
    const schedule = await scheduleRepository.findOne({
      where: {
        id: Number(trip_id),
      },
    });

    if (!schedule) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "일정을 찾을 수 없습니다",
      });
      return;
    }

    // 일정 삭제
    await scheduleRepository.remove(schedule);
    await resetScheduleIds();
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
};

// 이미지 업로드
export const uploadImage = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).send("No file uploaded.");
    return;
  }
  res.status(StatusCodes.OK).json({
    message: "File uploaded successfully!",
    filePath: `/uploads/${req.file.filename}`,
  });
};

// AUTO_INCREMENT 값을 재설정하는 함수
export const resetScheduleIds = async () => {
  try {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.startTransaction();

    // 현재 테이블에서 가장 큰 ID 값 구하기
    const result = await queryRunner.query(
      "SELECT MAX(id) AS max_id FROM schedule"
    );
    const maxId = result[0].max_id || 0; // 가장 큰 id 값 가져오기, 없으면 0

    // AUTO_INCREMENT를 max_id + 1로 설정
    await queryRunner.query(
      `ALTER TABLE schedule AUTO_INCREMENT = ${maxId + 1}`
    );

    await queryRunner.commitTransaction();
    await queryRunner.release();
  } catch (err) {
    console.error("ID 재정렬 오류:", err);
    throw err;
  }
};
