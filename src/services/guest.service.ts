import AppDataSource from "../data-source";
import { Invitaion } from "../entities/invitaion.entity";
import { Schedule } from "../entities/schedule.entity";
import crypto from 'crypto'

// 초대 링크 생성
export const insertInviteLink = async (
  tripId: number,
  inviteCode: string,
  userId: number,
) => {
  const inviteLinkRepository = AppDataSource.getRepository(Invitaion);
  const scheduleRepository = AppDataSource.getRepository(Schedule);
  
  const existingCode = await inviteLinkRepository.findOne({
    where: {
      link: inviteCode,
    },
  });

  if (existingCode) {
    const newInviteCode = crypto.randomBytes(16).toString("hex");
    await insertInviteLink(tripId, newInviteCode, userId); // 재귀 호출
    return;
  }
  
  const schedule = await scheduleRepository.findOne({ where: { id: tripId } });
  
  if (!schedule) {
    throw new Error("해당 일정을 찾을 수 없습니다.");
  }
  
  const link = `http://${process.env.ENDPOINT}:${process.env.PORT}/trips/companions/${tripId}/invite/${userId}/${inviteCode}`;
  // 새 초대 링크 객체 생성
  const newInviteLink = new Invitaion();
  newInviteLink.tripId = tripId;
  newInviteLink.link = link;
  newInviteLink.createLinkUser = userId;
  newInviteLink.invitedAt = new Date();

  // 데이터베이스에 저장
  await inviteLinkRepository.save(newInviteLink);
  console.log("초대링크가 저장되었습니다.");

  return link;
};
