import { Request, Response } from "express";
import { insertInviteLink } from "../services/guest.service";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import AppDataSource from "../data-source";
import { Guest } from "../entities/guest.entity";
import { Schedule } from "../entities/schedule.entity";

// 동행자 추가
export const addGuestToSchedule = async (req: Request, res: Response) => {
  const { tripId, userId, inviteCode } = req.params;

  try {
    const guestRepository = AppDataSource.getRepository(Guest);
    // 초대 링크 유효성 검증
    const guest = await guestRepository.findOne({
      where: {
        invite_code: inviteCode,
        user_id: Number(userId),
      },
      relations: ["schedule"],
    });
    // 초대 링크가 없으면 404 응답
    if (!guest) {
      res
        .status(404)
        .json({ message: "초대 링크를 찾을 수 없거나 잘못된 링크입니다." });
      return;
    }
    // 초대된 일정을 찾기
    const schedule = guest.schedule;
    // tripId가 맞는지 확인 (중복 방지)
    if (schedule.id !== Number(tripId)) {
      res
        .status(400)
        .json({
          message: "이 초대 링크는 해당 여행 일정과 일치하지 않습니다.",
        });
      return;
    }

    // 동행자 추가 로직 (동행자 목록에 추가)
    guest.accepted_at = new Date(); // 동행자가 초대를 수락한 시점

    // Guest 엔티티 업데이트
    await guestRepository.save(guest);

    // 동행자 추가가 성공적으로 완료되었음을 알려주는 응답
    res.status(200).json({
      message: "동행자가 여행 일정에 성공적으로 추가되었습니다.",
      guest: {
        userId: guest.user_id,
        inviteCode: guest.invite_code,
        acceptedAt: guest.accepted_at,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "동행자를 추가하는 중에 오류가 발생했습니다." });
  }
};

// 초대 링크 생성
export const createInviteLink = async (req: Request, res: Response) => {
  const { tripId } = req.params;
  const { userId } = req.body;

  try {
    const inviteCode = crypto.randomBytes(16).toString("hex");
    console.log(tripId, userId, inviteCode);
    await insertInviteLink(Number(tripId), Number(userId), inviteCode);

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
  const { tripId, userId } = req.params;

  try {
    const guestRepository = AppDataSource.getRepository(Guest);

    const guest = await guestRepository.findOne({
      where: {
        schedule: {
          id: Number(tripId),
        },
        user_id: Number(userId),
      },
      relations: ["schedule"],
    });

    if (!guest) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "해당 동행자를 찾을 수 없습니다.",
      });
      return;
    }

    await guestRepository.remove(guest);

    res.status(StatusCodes.OK).json({
      message: "동행자가 삭제되었습니다.",
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

    const allUsers = [
      {
        creator: schedule.id,
        role: "creator",
      },
      ...schedule.guests.map((guest) => ({
        guest: guest.user_id,
        role: "guest",
      })),
    ];

    res.status(StatusCodes.OK).json({
      users: allUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "동행자를 삭제하는 중 오류가 발생했습니다.",
    });
  }
};
