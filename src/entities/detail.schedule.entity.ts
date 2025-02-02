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
   
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  scheduleDate: Date;

  @Column({type: "time"})
  scheduleTime!: string;

  @Column()
  scheduleContent!: string;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Schedule, (schedule) => schedule.details, { onDelete: "CASCADE"})
  @JoinColumn({ name: 'scheduleId' })
  schedule!: Schedule;
}
