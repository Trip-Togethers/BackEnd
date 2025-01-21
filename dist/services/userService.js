"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inserUser = void 0;
const data_source_1 = __importDefault(require("../data-source"));
const user_entity_1 = require("../entities/user.entity");
// 회원 가입
const inserUser = async (name, email) => {
    const userRepository = data_source_1.default.getRepository(user_entity_1.User);
    // 새 사용자 객체 생성
    const newUser = new user_entity_1.User();
    newUser.username = name;
    newUser.email = email;
    // 데이터베이스에 저장
    await userRepository.save(newUser);
    console.log("User has been saved");
};
exports.inserUser = inserUser;
//# sourceMappingURL=userService.js.map