import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Token } from './entities/token.entity';
import { Schedule } from './entities/schedule.entity';
import { Detaile } from "./entities/detail.schedule.entity";
import { Guest } from "./entities/guest.entity";
import dotenv from "dotenv";
import { Comments, Likes, Posts } from './entities/community.entity';
import { Invitaion } from './entities/invitaion.entity';
import { Maps } from './entities/map.entity';
dotenv.config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Token, Schedule, Detaile, Guest, Posts, Comments, Likes, Invitaion, Maps],
  synchronize: true,
  logging: false,
});

export default AppDataSource;