import { Router, Request, Response } from "express";
import {
  createInviteLink,
  lookUpUserList,
  removeGuestToSchedule,
} from "../controller/guest.controller";
import { addGuestToSchedule } from "../controller/guest.controller";

const router: Router = Router();

// 초대 링크 생성
router.post("/:tripId/invite", (req: Request, res: Response) =>
  createInviteLink(req, res)
);

// 게스트 추가
router.get(
  "/:tripId/invite/:userId/:inviteCode",
  (req: Request, res: Response) => addGuestToSchedule(req, res)
);

// 게스트 삭제
router.delete("/:tripId/invite/:userId", (req: Request, res: Response) =>
  removeGuestToSchedule(req, res)
);

// 목록 조회
router.get("/:tripId", (req: Request, res: Response) =>
  lookUpUserList(req, res)
);
export default router;
