import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Schedule } from "./schedule.entity";

@Entity()
export class Guest {
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Column()
  user_id!: number; // 동행자의 사용자 ID

  @Column()
  email!: string;
  
  @Column()
  invite_code!: string;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  invited_at!: Date; // 초대 링크 생성 시점

  @Column({ type: 'datetime', nullable: true })
  accepted_at!: Date | null; // 동행자가 초대를 수락한 시점

  @ManyToOne(() => Schedule, (schedule) => schedule.guests, {onDelete: "CASCADE"})
  @JoinColumn({ name: 'schedule_id' })
  schedule!: Schedule; // 이 동행자가 속한 일정
}
