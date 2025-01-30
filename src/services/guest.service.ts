import AppDataSource from "../data-source";
import { Guest } from "../entities/guest.entity"; // 초대 링크 엔티티
import { Schedule } from "../entities/schedule.entity";
import crypto from 'crypto'

// 초대 링크 생성
export const insertInviteLink = async (
  tripId: number,
  userId: number,
  inviteCode: string,
  email: string
) => {
  const inviteLinkRepository = AppDataSource.getRepository(Guest);
  const scheduleRepository = AppDataSource.getRepository(Schedule);
  
  const existingCode = await inviteLinkRepository.findOne({
    where: {
      invite_code: inviteCode,
    },
  });

  if (existingCode) {
    const newInviteCode = crypto.randomBytes(16).toString("hex");
    await insertInviteLink(tripId, userId, newInviteCode, email); // 재귀 호출
    return;
  }
  
  const schedule = await scheduleRepository.findOne({ where: { id: tripId } });
  
  if (!schedule) {
    throw new Error("Schedule not found for the given tripId");
  }
  
  // 새 초대 링크 객체 생성
  const newGuestInviteLink = new Guest();
  newGuestInviteLink.schedule = schedule;
  newGuestInviteLink.user_id = userId;
  newGuestInviteLink.invite_code = inviteCode;
  newGuestInviteLink.invited_at = new Date();
  newGuestInviteLink.email = email

  // 데이터베이스에 저장
  await inviteLinkRepository.save(newGuestInviteLink);
  console.log("Invite link has been saved");
};
