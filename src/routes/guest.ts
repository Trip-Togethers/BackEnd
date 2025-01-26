import { Router, Request, Response } from "express";
import { createInviteLink, removeGuestToSchedule } from "../controller/guest.controller";
import { addGuestToSchedule } from "../controller/guest.controller";

const router: Router = Router(); 

// 초대 링크 생성
router.post("/:tripId/invite", (req: Request, res: Response) => createInviteLink(req, res));

// 게스트 추가
router.get("/:tripId/invite/:userId/:inviteCode", (req: Request, res: Response) => addGuestToSchedule(req, res));

// 게스트 삭제
router.delete("/:tripId/invite/:userId", (req: Request, res: Response) => removeGuestToSchedule(req, res));

export default router;