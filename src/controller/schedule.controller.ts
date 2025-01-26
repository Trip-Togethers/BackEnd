import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { insertSchedule } from "../services/schedule.service";
import AppDataSource from "../data-source";
import { Schedule } from "../entities/schedule.entity";
import { body, validationResult } from "express-validator"; 

// 여행 일정 조회
export const lookUpTrips = async (req: Request, res: Response) => {
  await body("email")
    .notEmpty()
    .withMessage("이메일을 입력해주세요.")
    .isEmail()
    .withMessage("유효한 이메일을 입력해 주세요")
    .run(req);
  // 유효성 검사 결과 확인
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(StatusCodes.BAD_REQUEST).json({
      errors: errors.array(),
    });
    return;
  }

  const { email } = req.body;

  // 이메일에 해당하는 일정 조회
  const scheduleRepository = AppDataSource.getRepository(Schedule);
  const user = await scheduleRepository.find({
    where: { user: email },
  });

  if (!user || user.length === 0) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "User not found",
    });
    return;
  }

  res.status(StatusCodes.OK).json({
    schedules: user,
  });
};

// 여행 일정 추가
export const addTrips = async (req: Request, res: Response) => {
  // express-validator로 요청 데이터 검증
  await body("title")
    .notEmpty()
    .withMessage("제목을 입력해 주세요")
    .isLength({ min: 3, max: 50 })
    .withMessage("제목은 3자 이상, 50자 이하로 입력해 주세요.")
    .run(req);
  await body("startDate")
    .isDate()
    .withMessage("시작일을 올바르게 입력해 주세요")
    .run(req);
  await body("endDate")
    .isDate()
    .withMessage("종료일을 올바르게 입력해 주세요")
    .custom((value, { req }) => {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      
      if (startDate > endDate) {
        throw new Error("종료일은 시작일보다 늦어야 합니다.");
      }
      return true;
    })
    .run(req);
  await body("destination")
    .notEmpty()
    .withMessage("목적지를 입력해 주세요")
    .run(req);
  await body("email")
    .isEmail()
    .withMessage("유효한 이메일을 입력해 주세요")
    .run(req);

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
  const photoUrl = photoFilePath ? photoFilePath : '';
  try {
    await insertSchedule(title, destination, startDate, endDate, email, photoUrl);
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

// 경로 리턴해주는 함수
const handleFileUpload = (req: Request): string | null => {
  if (!req.file) {
    return null;
  }
  return `/uploads/${req.file.filename}`;
}

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
