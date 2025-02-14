import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('maps')
export class Maps {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
    
    @Column({ type: 'int', unsigned: true })
    userId: number;

    @Column({ type: 'varchar', length: 255, charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
    name: string;

    @Column({ type: 'float'})
    latitude: number;

    @Column({ type: 'float'})
    longitude: number;

    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date;

    @Column({ type: 'float', nullable: true })
    rating: number; // 평점

    @Column({ type: 'varchar', length: 255, nullable: true, charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
    vicinity: string; // 지역

    @Column('simple-array', { nullable: true })
    photos: string[]; // 사진 URLs (배열로 저장)
}