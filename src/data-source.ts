import "reflect-metadata";
taSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Token } from './entities/token.entity';
import { Schedule } from './entities/schedule.entity';
import { Detaile } from "./entities/detail.schedule.entity";
import { Guest } from "./entities/guest.entity";
import dotenv from "dotenv";
dotenv.config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Token, Schedule, Detaile, Guest],
  synchronize: true,
  logging: false,
});

export default AppDataSource;