"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schedule_controller_1 = require("../controller/schedule.controller");
const multer_config_1 = require("../middleware/multer.config");
const router = (0, express_1.Router)();
// 여행 일정 조회
router.get("/", (req, res) => (0, schedule_controller_1.allTrips)(req, res));
// 여행 일정 추가
router.post("/", (req, res) => (0, schedule_controller_1.addTrips)(req, res));
// 여행 일정 삭제
router.delete("/:trip_id", (req, res) => (0, schedule_controller_1.removeTrips)(req, res));
// 사진 업로드
router.post("/upload", multer_config_1.upload.single('image'), schedule_controller_1.uploadImage);
exports.default = router;
//# sourceMappingURL=schedule.js.map