import "reflect-metadata";
import { DataSource } from "typeorm";

import dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql", // 사용할 데이터베이스 타입 (mysql, postgres, sqlite 등)
  host: process.env.DB_HOST,
  port: 3306, // MySQL 기본 포트
  username: process.env.DB_NAME, // 데이터베이스 사용자명
  password: process.env.DB_PASS, // 데이터베이스 비밀번호
  database: process.env.DB_BASE, // 사용할 데이터베이스 이름
  synchronize: true, // 앱 실행 시 데이터베이스와 동기화 (개발 중에만 사용)
  logging: false, // 쿼리 로그 출력 여부
  entities: ["src/entities/*.ts"], // 엔티티 파일 경로
  migrations: ["src/migrations/*.ts"], // 마이그레이션 파일 경로
});
