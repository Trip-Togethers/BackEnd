import { Router, Request, Response } from "express";
import {
  addDetailTrips,
  lookUpDetailTrips,
  editDetailTrips,
  removeDetailTrips,
} from "../controllers/detail.schedule.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router: Router = Router(); 

// 세부 일정 조회
router.get("/:tripId", authMiddleware, (req: Request, res: Response) =>
  lookUpDetailTrips(req, res)
);

// 세부 일정 추가
router.post("/:tripId", authMiddleware, (req: Request, res: Response) =>
  addDetailTrips(req, res)
);

// 세부 일정 수정
router.put("/:tripId/:activityId", authMiddleware, (req: Request, res: Response) =>
  editDetailTrips(req, res)
); 
// 세부 일정 삭제
router.delete("/:tripId/:activityId", authMiddleware, (req: Request, res: Response) =>
  removeDetailTrips(req, res)
);

export default router;
