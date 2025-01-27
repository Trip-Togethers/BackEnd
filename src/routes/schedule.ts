import { Router, Request, Response } from "express";
import {
  addTrips,
  removeTrips,
  loopUpTrips
} from "../controller/schedule.controller";
import { upload } from "../middleware/multer.config";


const router: Router = Router(); 

// 여행 일정 조회
router.get("/", (req: Request, res: Response) => loopUpTrips(req, res));

// 여행 일정 추가
router.post("/", upload.single("image"), (req: Request, res: Response) => addTrips(req, res));

// 여행 일정 삭제
router.delete("/:tripId", (req: Request, res: Response) => removeTrips(req, res));


export default router;
