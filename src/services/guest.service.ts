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
  
  // 초대 링크가 존재하는지 확인
  let existingCode = await inviteLinkRepository.findOne({
    where: {
      inviteCode: inviteCode,
    },
  })

  while (existingCode) {
    const newInviteCode = crypto.randomBytes(16).toString("hex");
    existingCode = await inviteLinkRepository.findOne({
      where: {
        inviteCode: newInviteCode,
      },
    });
  }
  
  const schedule = await scheduleRepository.findOne({ where: { id: tripId } });
  
  if (!schedule) {
    throw new Error("해당 일정을 찾을 수 없습니다.");
  }
  
  const link = `${process.env.ENDPOINT}:${process.env.PORT}/trips/companions/${tripId}/invite/${userId}/${inviteCode}`;
  // 새 초대 링크 객체 생성
  const newInviteLink = new Invitaion();
  newInviteLink.tripId = tripId;
  newInviteLink.inviteCode = link;
  newInviteLink.createLinkUser = userId;
  newInviteLink.invitedAt = new Date();

  // 데이터베이스에 저장
  await inviteLinkRepository.save(newInviteLink);
  console.log("초대링크가 저장되었습니다.");

  return link;
};
