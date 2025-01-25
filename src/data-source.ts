import { DataSource } from "typeorm";
import { Schedule } from "./entities/schedule.entity";

const AppDataSource = new DataSource({
  type: "mysql",
  host: "127.0.0.1", // DB 호스트
  port: 3306, // MySQL 포트
  username: "root", // DB 사용자명
  password: "root", // DB 비밀번호
  database: "trip_together", // DB 이름
  synchronize: true, // 개발 환경에서는 true, 배포 환경에서는 false
  logging: true,
  entities: [Schedule], // 엔티티 등록
});

export default AppDataSource;
