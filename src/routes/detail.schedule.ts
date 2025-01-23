import { Router, Request, Response } from "express";
import {
  addDetailTrips,
  allDetailTrips,
  editDetailTrips,
  removeDetailTrips,
} from "../controller/detail.schedule.controller";

const router: Router = Router();

// 세부 일정 조회
router.get("/:tripId", (req: Request, res: Response) =>
  allDetailTrips(req, res)
);

// 세부 일정 추가
router.post("/:tripId", (req: Request, res: Response) =>
  addDetailTrips(req, res)
);

// 세부 일정 수정
router.put("/:tripId", (req: Request, res: Response) =>
  editDetailTrips(req, res)
);
// 세부 일정 삭제
router.delete("/:tripId", (req: Request, res: Response) =>
  removeDetailTrips(req, res)
);
// 초대하기

export default router;
