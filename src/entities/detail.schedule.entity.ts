import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Schedule } from "./schedule.entity";

@Entity("detaile_schedule")
export class Detaile {
  @PrimaryGeneratedColumn()
  id!: number; 
   
  @Column()
  schedule_date!: Date;

  @Column({type: "time"})
  schedule_time!: string;

  @Column()
  schedule_content!: string;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Schedule, (schedule) => schedule.details, { onDelete: "CASCADE"})
  @JoinColumn({ name: 'schedule_id' })
  schedule!: Schedule;
}
