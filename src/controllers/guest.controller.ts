import { Request, Response } from "express";
import { insertInviteLink } from "../services/guest.service";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import AppDataSource from "../data-source";
import { Guest } from "../entities/guest.entity";
import { Schedule } from "../entities/schedule.entity";
import { User } from "../entities/user.entity";
import {
  validateInvite,
  validateRemoveGuest,
  validateTripId,
} from "../middleware/guest.validators";
import { validationResult } from "express-validator";

// 동행자 추가
export const addGuestToSchedule = async (req: Request, res: Response) => {
  await Promise.all(validateInvite.map((validator) => validator.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { tripId, userId } = req.params; // 여행아이디, 초대자아이디
  const guestId = req.user?.userId; // 동행자 아이디
  const email = req.user?.email;
  if (!email || !guestId) {
    res.status(StatusCodes.NOT_FOUND).json({
      message: "해당 이메일 또는 아이디를 찾을 수 없습니다.",
    });
    return;
  }

  try {
    if (guestId === Number(userId)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "초대자는 동행자로 추가될 수 없습니다.",
      });
      return;
    }

    const guestRepository = AppDataSource.getRepository(Guest);

    // 초대 링크에 해당하는 동행자 정보 조회
    const guest = await guestRepository.findOne({
      where: {
        userId: Number(userId),
        schedule: { id: Number(tripId) },
      },
      relations: ["schedule"],
    });
    console.log(guest);

    // 이미 동행자로 추가된 유저인지 확인
    const existingGuest = await guestRepository.findOne({
      where: {
        userId: guestId,
        schedule: { id: Number(tripId) },
      },
    });

    // 초대 링크가 유효하지 않거나, 해당 초대 코드가 없을 경우
    if (existingGuest) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "이미 동행자로 추가된 사용자입니다." });
      return;
    }

    const mainSchedule = await AppDataSource.getRepository(Schedule).findOne({
      where: { id: Number(tripId) },
    });
    // 메인 일정이 없으면 오류 처리
    if (!mainSchedule) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "메인 일정을 찾을 수 없습니다.",
      });
      return;
    }
    if (!guest) {
      // guest가 없으면 새로운 동행자 추가
      const newGuest = guestRepository.create({
        userId: guestId, // 동행자의 userId
        email: email, // 동행자의 email
        schedule: mainSchedule, // 여행 스케줄
        acceptedAt: new Date(), // 초대 수락 시각
      });

      // 데이터베이스에 저장 (동행자 정보 업데이트)
      await guestRepository.save(newGuest);

      console.log(mainSchedule);
      res.status(StatusCodes.OK).json({
        message: "동행자가 여행 일정에 성공적으로 추가되었습니다.",
        guest: {
          userId: newGuest.userId,
          email: email,
          acceptedAt: newGuest.acceptedAt,
        },
      });
    }
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "동행자를 추가하는 중에 오류가 발생했습니다." });
  }
};

// 초대 링크 생성
export const createInviteLink = async (req: Request, res: Response) => {
  await Promise.all(validateTripId.map((validator) => validator.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { tripId } = req.params;
  const userId = req.user?.userId;
  const email = req.user?.email;
  if (!email || !userId) {
    res.status(StatusCodes.NOT_FOUND).json({
      message: "해당 이메일 또는 아이디를 찾을 수 없습니다.",
    });
    return;
  }

  try {
    const scheduleRepository = AppDataSource.getRepository(Schedule);
    const schedule = await scheduleRepository.findOne({
      where: {
        id: Number(tripId),
      },
    });

    if (!schedule) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "일정을 찾을 수 없습니다.",
      });
      return;
    }

    const inviteCode = crypto.randomBytes(16).toString("hex");
    await insertInviteLink(Number(tripId), inviteCode);
    const inviteLink = `http://${process.env.ENDPOINT}:${process.env.PORT}/trips/companions/${tripId}/invite/${userId}/${inviteCode}`;

    res.status(StatusCodes.OK).json({
      message: inviteLink,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "초대 링크 생성에 실패했습니다.",
    });
  }
};

// 동행자 삭제
export const removeGuestToSchedule = async (req: Request, res: Response) => {
  await Promise.all(validateRemoveGuest.map((validator) => validator.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { tripId, guestId } = req.params;
  const userId = req.user?.userId;
  if (!userId) {
    res.status(StatusCodes.NOT_FOUND).json({
      message: "해당 아이디를 찾을 수 없습니다.",
    });
    return;
  }

  try {
    const guestRepository = AppDataSource.getRepository(Guest);

    // 삭제하려는 동행자 정보 조회
    const guest = await guestRepository.findOne({
      where: {
        userId: Number(guestId), // 삭제하려는 동행자 ID
        schedule: { id: Number(tripId) }, // 해당 여행 일정
      },
      relations: ["schedule"], // 여행 일정도 함께 로드
    });

    if (!guest) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "해당 동행자를 찾을 수 없습니다.",
      });
      return;
    }

    // 현재 로그인한 사용자가 초대자인지 확인
    if (guest.schedule.owner !== userId) {
      res.status(StatusCodes.FORBIDDEN).json({
        message: "초대자만 동행자를 삭제할 수 있습니다.",
      });
      return;
    }

    // 동행자 삭제
    await guestRepository.remove(guest);

    // 삭제 성공 응답
    res.status(StatusCodes.OK).json({
      message: "동행자가 여행 일정에서 삭제되었습니다.",
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "동행자를 삭제하는 중 오류가 발생했습니다.",
    });
  }
};

// 목록 조회
export const lookUpUserList = async (req: Request, res: Response) => {
  await Promise.all(validateRemoveGuest.map((validator) => validator.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { tripId } = req.params;

  try {
    const scheduleRepository = AppDataSource.getRepository(Schedule);

    // 일정과 관련된 모든 사용자
    const schedule = await scheduleRepository.findOne({
      where: {
        id: Number(tripId),
      },
      relations: ["guests"],
    });

    if (!schedule) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "일정을 찾을 수 없습니다.",
      });
      return;
    }
    const userRepository = AppDataSource.getRepository(User);
    const owner = await userRepository.findOne({
      where: { id: schedule.owner },
    });

    const allUsers = [
      {
        creator: owner?.email,
        role: "creator",
      },
      ...schedule.guests.map((guest) => ({
        guest: guest.email,
        role: "guest",
        id: guest.userId,
      })),
    ];

    res.status(StatusCodes.OK).json({
      users: allUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "동행자를 조회하는 중 오류가 발생했습니다.",
    });
  }
};
