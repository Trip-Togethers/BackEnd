"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const schedule_entity_1 = require("./entities/schedule.entity");
const AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: "127.0.0.1", // DB 호스트
    port: 3306, // MySQL 포트
    username: "root", // DB 사용자명
    password: "root", // DB 비밀번호
    database: "trip_together", // DB 이름
    synchronize: true, // 개발 환경에서는 true, 배포 환경에서는 false
    logging: true,
    entities: [user_entity_1.User, schedule_entity_1.Schedule], // 엔티티 등록
});
exports.default = AppDataSource;
//# sourceMappingURL=data-source.js.map