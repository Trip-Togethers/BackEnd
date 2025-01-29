import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  token!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
