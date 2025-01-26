import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Users } from './user.entity';

@Entity('maps')
export class Maps {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @ManyToOne(() => Users, (user) => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: Users;
    @Column({ type: 'int', unsigned: true })
    user_id: number;

    @Column({ type: 'varchar', length: 255, charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
    name: string;

    @Column({ type: 'float'})
    latitude: number;

    @Column({ type: 'float'})
    longitude: number;

    @CreateDateColumn({ type: 'datetime' })
    created_at: Date;
}