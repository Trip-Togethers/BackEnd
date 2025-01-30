import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { insertSchedule } from "../services/schedule.service";
import AppDataSource from "../data-source";
import { Schedule } from "../entities/schedule.entity";
import { validationResult } from "express-validator";
import { uploadParams } from "../middleware/multer.config";
import { validateAddTrip } from "../middleware/schedule.validators";
import { error } from "console";
import { User } from "../entities/user.entity";
import { Guest } from "../entities/guest.entity";
import { getScheduleByIdAndUserEmail, getUserByEmail } from "../services/detail.schedul.service";

// 여행 일정 조회
export const loopUpTrips = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "인증 토큰이 필요합니다.",
    });
    return;
  }

  const email = (req as any).user.email;
  const userId = (req as any).user.userId;
  try {
    // 이메일에 해당하는 사용자 조회
    const user = await AppDataSource.getRepository(User).findOne({
      where: { email: email },
      relations: ["schedule"],
    });

    if (!user) {
      res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      return;
    }

    // 초대자일 경우 (일정의 owner)
    const ownerSchedules = await AppDataSource.getRepository(Schedule).find({
      where: { owner: userId },
      relations: ["guests"], // 동행자 정보도 가져오기
    });

    // 동행자일 경우 (guests에 본인 이메일이 포함된 일정)
    const guestSchedules = await AppDataSource.getRepository(Guest).find({
      where: { email: email },
      relations: ["schedule"],
    });

    // 초대자 일정과 동행자 일정 합치기
    const allSchedules = [
      ...ownerSchedules, // 초대자의 일정
      ...guestSchedules.map((guest) => guest.schedule), // 동행자의 일정
    ];

    if (allSchedules.length === 0) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "동행자 또는 초대자가 속한 일정이 없습니다.",
      });
      return;
    }

    // 일정 응답
    res.status(StatusCodes.OK).json({
      schedules: allSchedules, // 초대자와 동행자 모두 포함한 일정 목록 반환
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

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "인증 토큰이 필요합니다.",
    });
    return;
  }

  // 제목, 목적지, 기간 (시작일, 종료일)
  const { title, destination, startDate, endDate } = req.body;
  const photoFilePath = handleFileUpload(req);
  const email = (req as any).user.email;
  const owner = (req as any).user.userId;
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
      photoUrl,
      owner
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
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "인증 토큰이 필요합니다.",
    });
    return;
  }

  const email = (req as any).user.email;
  const userId = (req as any).user.userId;

  if (!tripId || isNaN(tripId)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "삭제할 일정 ID를 올바르게 제공해주세요.",
    });
    return;
  }

  // 일정 조회
  try {
    const scheduleRepository = AppDataSource.getRepository(Schedule);
    const userRepository = AppDataSource.getRepository(User);
    const guestRepository = AppDataSource.getRepository(Guest);

    // 이메일로 사용자 조회
    const user = await userRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "사용자를 찾을 수 없습니다.",
      });
      return;
    }

    // 초대자인 경우: 사용자 본인이 소유한 일정 찾기
    let schedule = await scheduleRepository.findOne({
      where: {
        id: tripId,
        owner: userId,
      },
    });

    // 동행자인 경우: 동행자 초대받은 일정 찾기
    if (!schedule) {
      const guest = await guestRepository.findOne({
        where: {
          email: email,
        },
        relations: ["schedule"], // 동행자 일정 정보 가져오기
      });

      // 동행자가 초대받은 일정이 없으면 에러
      if (!guest) {
        res.status(StatusCodes.NOT_FOUND).json({
          message: "동행자가 초대받은 일정이 없습니다.",
        });
        return;
      }

      schedule = guest.schedule; // 동행자가 초대받은 일정으로 설정

      // 동행자는 본인만의 일정 삭제 권한이 있으므로,
      // 일정을 삭제할 경우 guest 테이블에서만 삭제
      await guestRepository.delete({
        email: email,
        schedule: { id: tripId }, // 해당 일정 삭제
      });

      // 모든 동행자에서 해당 일정 삭제
      await guestRepository.delete({
        schedule: { id: tripId }, // 해당 일정에 초대된 모든 동행자 삭제
      });

      res.status(StatusCodes.OK).json({
        message: "동행자의 일정 삭제가 완료되었습니다.",
      });

      return;
    }

    if (schedule) {
      // 일정 삭제
      try {
        await scheduleRepository.delete(tripId);

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

// 여행 일정 수정
export const editTrips = async (req: Request, res:Response) => {
  const tripId = Number(req.params.tripId);
  const { startDate, endDate, title, description } = req.body;

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

  const email = (req as any).user.email;

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
      res.status(StatusCodes.NOT_FOUND).json({ message: "일정을 찾을 수 없습니다." });
      return;
    }

    // 여행 일정 수정
    if (startDate) schedule.start_date = new Date(startDate);
    if (endDate) schedule.end_date = new Date(endDate);
    if (title) schedule.title = title;
    if (description) schedule.destination = description;
    if (photoUrl) schedule.photo_url = photoUrl;

    // 수정된 일정 저장
    await AppDataSource.getRepository(Schedule).save(schedule);

    res.status(StatusCodes.OK).json({
      message: "여행 일정이 성공적으로 수정되었습니다.",
      schedule: {
        id: schedule.id,
        startDate: schedule.start_date,
        endDate: schedule.end_date,
        title: schedule.title,
        description: schedule.destination,
      },
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "서버 오류" });
  }
};

// 경로 리턴해주는 함수
const handleFileUpload = (req: Request): string | null => {
  if (!req.file) {
    return null;
  }
  return `/uploads/${req.file.filename}`;
};
