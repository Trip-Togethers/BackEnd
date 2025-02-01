import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from "typeorm";
import { Posts } from "./community.entity";
import { Schedule } from "./schedule.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ nullable: true })
  nickname?: string;

  @Column({ unique: true, nullable: true })  // ✅ Google 로그인 시 필요한 필드 추가
  googleId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Schedule, (schedule) => schedule.user)
  schedule?: Schedule[];

  @Column({ nullable: true, default: '' })
  profilePicture: string;

  @Column({ nullable: true, default: '' })
  contact: string;

  @Column({ nullable: true, default: '' })
  loginCategory: string;

  @DeleteDateColumn({ type: "datetime", nullable: true })
  deletedAt: Date;

  @OneToMany(() => Posts, (post) => post.user)
  posts: Posts[];

  // @OneToMany(() => Participant, (participant) => participant.user)
  // participant!: Participant[];
}
