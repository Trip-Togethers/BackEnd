import { Request, Response } from "express";
import { insertInviteLink } from "../services/guest.service";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import AppDataSource from "../data-source";
import { Guest } from "../entities/guest.entity";
import { Schedule } from "../entities/schedule.entity";
import { User } from "../entities/user.entity";

// 동행자 추가
export const addGuestToSchedule = async (req: Request, res: Response) => {
  const { tripId, userId } = req.params; // 여행아이디, 초대자아이디
  const guestId = (req as any).user.userId; // 동행자 아이디
  const email = (req as any).user.email;

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
        user_id: Number(userId), // 초대자 ID
        schedule: { id: Number(tripId) }, // 여행 일정
      },
      relations: ["schedule"], // 여행 일정 정보도 가져오기
    });

    // 이미 동행자로 추가된 유저인지 확인
    const existingGuest = await guestRepository.findOne({
      where: {
        user_id: guestId, // 이미 추가된 동행자 여부
        schedule: { id: Number(tripId) }, // 해당 여행 일정에 추가되어 있는지
      },
    });

    // 초대 링크가 유효하지 않거나, 해당 초대 코드가 없을 경우
    if (existingGuest) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "이미 동행자로 추가된 사용자입니다." });
      return;
    } else if (!guest) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "초대 링크가 유효하지 않거나 잘못된 링크입니다." });
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
    // 동행자 추가: 수락 시점 설정
    guest.accepted_at = new Date(); // 초대 수락 시각
    guest.user_id = guestId; // 동행자 ID 설정
    guest.email = email;
    guest.schedule = mainSchedule;

    // 데이터베이스에 저장 (동행자 정보 업데이트)
    await guestRepository.save(guest);

    console.log(mainSchedule)
    res.status(StatusCodes.OK).json({
      message: "동행자가 여행 일정에 성공적으로 추가되었습니다.",
      guest: {
        userId: guest.user_id,
        email: email,
        inviteCode: guest.invite_code,
        acceptedAt: guest.accepted_at,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "동행자를 추가하는 중에 오류가 발생했습니다." });
  }
};

// 초대 링크 생성
export const createInviteLink = async (req: Request, res: Response) => {
  const { tripId } = req.params;
  const userId = (req as any).user.userId;
  const email = (req as any).user.email;

  try {
    const inviteCode = crypto.randomBytes(16).toString("hex");
    console.log(tripId, userId, inviteCode);
    await insertInviteLink(Number(tripId), userId, inviteCode, email);

    const inviteLink = `localhost:1111/trips/companions/${tripId}/invite/${userId}/${inviteCode}`;

    console.log(inviteLink);
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
  const { tripId, guestId } = req.params;
  const userId = (req as any).user.userId;

  try {
    const guestRepository = AppDataSource.getRepository(Guest);

    // 삭제하려는 동행자 정보 조회
    const guest = await guestRepository.findOne({
      where: {
        user_id: Number(guestId), // 삭제하려는 동행자 ID
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
        id: guest.user_id,
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
