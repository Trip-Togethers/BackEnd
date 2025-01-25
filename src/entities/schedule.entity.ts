import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn, 
} from "typeorm";

import { Detaile } from "./detail.schedule.entity";

@Entity("schedule")
export class Schedule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  title!: string;

  @Column("text")
  destination!: string;

  @Column()
  start_date!: Date;

  @Column()
  end_date!: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  @UpdateDateColumn()
  updated_at!: Date;

  @Column()
  user!: string

  @Column()
  photo_url!: string
  
  @OneToMany(() => Detaile, (detail) => detail.schedule)
  details!: Detaile[]; // 여러 개의 세부 일정을 포함하는 관계 설정
}
