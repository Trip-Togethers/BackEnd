import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

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

  // user_id 외래키 설정
  @Column()
  user!: string;
}
