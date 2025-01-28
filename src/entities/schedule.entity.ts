import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";

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
  photo_url!: string;

  // user_id 외래키 설정
  @ManyToOne(() => User, (user) => user.schedule)
  @JoinColumn({ name: "user_email", referencedColumnName: "email" })
  user!: User;
}
