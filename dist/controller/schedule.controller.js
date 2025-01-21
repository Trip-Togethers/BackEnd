"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetScheduleIds = exports.uploadImage = exports.removeTrips = exports.addTrips = exports.allTrips = void 0;
const http_status_codes_1 = require("http-status-codes");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = __importDefault(require("../middleware/auth"));
const schedule_service_1 = require("../services/schedule.service");
const data_source_1 = __importDefault(require("../data-source"));
const schedule_entity_1 = require("../entities/schedule.entity");
const user_entity_1 = require("../entities/user.entity");
// 여행 일정 조회
const allTrips = async (req, res) => {
    const authorization = (0, auth_1.default)(req, res);
    const user_email = authorization.email;
    if (!handleAuthorization(authorization, res)) {
        return; // 인증이 실패하면 더 이상 진행하지 않음
    }
    // 이메일에 해당하는 일정 조회
    const scheduleRepository = data_source_1.default.getRepository(user_entity_1.User);
    const user = await scheduleRepository.findOne({
        where: { email: user_email },
        relations: ["schedule"],
    });
    if (!user) {
        throw new Error("User not found");
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        schedules: user.schedule,
    });
};
exports.allTrips = allTrips;
// 여행 일정 추가
const addTrips = async (req, res) => {
    const authorization = (0, auth_1.default)(req, res);
    if (!handleAuthorization(authorization, res)) {
        return;
    }
    // 대표 이미지 선택
    // 제목, 목적지, 기간 (시작일, 종료일)
    const { title, destination, start_date, end_date } = req.body;
    const user_email = authorization.email;
    if (!title || !start_date || !end_date || !destination) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            message: "제목과 시작일, 종료일을 모두 입력해 주세요",
        });
        return;
    }
    else {
        try {
            await (0, schedule_service_1.insertSchedule)(title, destination, start_date, end_date, user_email);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Schedule created successfully",
                user: authorization,
            });
        }
        catch (error) {
            // 500 에러
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Error creating user",
                error,
            });
        }
    }
};
exports.addTrips = addTrips;
// 여행 일정 삭제
const removeTrips = async (req, res) => {
    const { trip_id } = req.params;
    if (!trip_id || isNaN(Number(trip_id))) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            message: "삭제할 일정 ID를 올바르게 제공해주세요.",
        });
        return;
    }
    try {
        const scheduleRepository = data_source_1.default.getRepository(schedule_entity_1.Schedule);
        const schedule = await scheduleRepository.findOne({
            where: {
                id: Number(trip_id),
            },
        });
        if (!schedule) {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                message: "일정을 찾을 수 없습니다",
            });
            return;
        }
        // 일정 삭제
        await scheduleRepository.remove(schedule);
        await (0, exports.resetScheduleIds)();
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "일정이 성공적으로 삭제되었습니다.",
        });
    }
    catch (err) {
        const error = err;
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "일정 삭제 중 오류가 발생했습니다.",
            error: error.message,
        });
    }
};
exports.removeTrips = removeTrips;
// 이미지 업로드
const uploadImage = (req, res) => {
    if (!req.file) {
        res.status(400).send("No file uploaded.");
        return;
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: "File uploaded successfully!",
        filePath: `/uploads/${req.file.filename}`,
    });
};
exports.uploadImage = uploadImage;
// AUTO_INCREMENT 값을 재설정하는 함수
const resetScheduleIds = async () => {
    try {
        const queryRunner = data_source_1.default.createQueryRunner();
        await queryRunner.startTransaction();
        // 현재 테이블에서 가장 큰 ID 값 구하기
        const result = await queryRunner.query("SELECT MAX(id) AS max_id FROM schedule");
        const maxId = result[0].max_id || 0; // 가장 큰 id 값 가져오기, 없으면 0
        // AUTO_INCREMENT를 max_id + 1로 설정
        await queryRunner.query(`ALTER TABLE schedule AUTO_INCREMENT = ${maxId + 1}`);
        await queryRunner.commitTransaction();
        await queryRunner.release();
    }
    catch (err) {
        console.error("ID 재정렬 오류:", err);
        throw err;
    }
};
exports.resetScheduleIds = resetScheduleIds;
function handleAuthorization(authorization, res) {
    if (authorization instanceof jsonwebtoken_1.default.TokenExpiredError) {
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
            message: "로그인 세션이 만료되었습니다. 다시 로그인해주세요.",
        });
        return false; // 에러 상태 반환
    }
    else if (authorization instanceof jsonwebtoken_1.default.JsonWebTokenError) {
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
            message: "잘못된 토큰입니다.",
        });
        return false; // 에러 상태 반환
    }
    else if (authorization === null) {
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
            message: "비로그인 상태입니다. 로그인 후 이용해주세요.",
        });
        return false; // 에러 상태 반환
    }
    return true; // 유효한 상태
}
//# sourceMappingURL=schedule.controller.js.map