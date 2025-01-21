"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertSchedule = void 0;
const data_source_1 = __importDefault(require("../data-source"));
const schedule_entity_1 = require("../entities/schedule.entity");
const user_entity_1 = require("../entities/user.entity");
// 일정 생성
const insertSchedule = async (title, destination, start_date, end_date, user_email) => {
    const scheduleRepository = data_source_1.default.getRepository(schedule_entity_1.Schedule);
    const userRepository = data_source_1.default.getRepository(user_entity_1.User);
    // 유저를 이메일로 찾아서 저장
    const user = await userRepository.findOne({
        where: { email: user_email },
    });
    if (!user) {
        throw new Error("User not found");
    }
    // 새 일정 객체 생성
    const newSchedule = new schedule_entity_1.Schedule();
    newSchedule.title = title;
    newSchedule.destination = destination;
    newSchedule.start_date = start_date;
    newSchedule.end_date = end_date;
    newSchedule.user = user;
    // 데이터 베이스에 저장
    await scheduleRepository.save(newSchedule);
    console.log("Schedule has been saved");
};
exports.insertSchedule = insertSchedule;
//# sourceMappingURL=schedule.service.js.map