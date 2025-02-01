import {
  Column,
  Entity,
  OneToMany,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Detaile } from "./detail.schedule.entity";
import { Guest } from './guest.entity';

@Entity("schedule")
export class Schedule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  title!: string;

  @Column("text")
  destination!: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  startDate: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  endDate: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  @UpdateDateColumn()
  updatedAt!: Date;

  @Column()
  photoUrl: string;

  @OneToMany(() => Detaile, (detail) => detail.schedule)
  details!: Detaile[]; // 여러 개의 세부 일정을 포함하는 관계 설정
  
  @OneToMany(() => Guest, (guest) => guest.schedule)
  guests!: Guest[]; // 동행자 목록

  // user_id 외래키 설정
  @ManyToOne(() => User, (user) => user.schedule, {onDelete: "CASCADE"})
  @JoinColumn({ name: "userEmail", referencedColumnName: "email" })
  user!: User;

  @Column()
  owner: number;
}
