import { Router, Request, Response } from "express";
import {
  allTrips,
  addTrips,
  removeTrips,
  uploadImage
} from "../controller/schedule.controller";
import { upload } from "../middleware/multer.config";


const router: Router = Router();

// 여행 일정 조회
router.get("/", (req: Request, res: Response) => allTrips(req, res));

// 여행 일정 추가
router.post("/", (req: Request, res: Response) => addTrips(req, res));

// 여행 일정 삭제
router.delete("/:trip_id", (req: Request, res: Response) => removeTrips(req, res));

// 사진 업로드
router.post("/upload", upload.single('image'), uploadImage);

export default router;
