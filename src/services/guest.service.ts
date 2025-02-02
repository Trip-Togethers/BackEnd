import AppDataSource from "../data-source";
import { Guest } from "../entities/guest.entity"; // 초대 링크 엔티티
import { Schedule } from "../entities/schedule.entity";
import crypto from 'crypto'

// 초대 링크 생성
export const insertInviteLink = async (
  tripId: number,
  inviteCode: string,
) => {
  const inviteLinkRepository = AppDataSource.getRepository(Guest);
  const scheduleRepository = AppDataSource.getRepository(Schedule);
  
  const existingCode = await inviteLinkRepository.findOne({
    where: {
      inviteCode: inviteCode,
    },
  });

  if (existingCode) {
    const newInviteCode = crypto.randomBytes(16).toString("hex");
    await insertInviteLink(tripId, newInviteCode); // 재귀 호출
    return;
  }
  
  const schedule = await scheduleRepository.findOne({ where: { id: tripId } });
  
  if (!schedule) {
    throw new Error("해당 일정을 찾을 수 없습니다.");
  }
  
  // 새 초대 링크 객체 생성
  const newGuestInviteLink = new Guest();
  newGuestInviteLink.schedule = schedule;
  newGuestInviteLink.inviteCode = inviteCode;
  newGuestInviteLink.invitedAt = new Date();

  // 데이터베이스에 저장
  await inviteLinkRepository.save(newGuestInviteLink);
  console.log("초대링크가 저장되었습니다.");
};
