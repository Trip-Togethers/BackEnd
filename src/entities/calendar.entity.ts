import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Users } from './user.entity';

@Entity('trip')
export class Trips {
    @PrimaryGeneratedColumn({ unsigned: true })
    trip_id: number;

    @ManyToOne(() => Users, (user) => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: Users;
    @Column({ type: 'int', unsigned: true })
    user_id: number;

    @Column({ type: 'varchar', length: 255, charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
    photo_url: string;

    @Column({ type: 'varchar', length: 255, charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
    title: string;

    @Column({ type: 'varchar', length: 255, charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
    destination: string;

    @Column({ type: 'date'})
    start_date: Date;

    @Column({ type: 'date'})
    end_date: Date;

    @Column({ type: 'varchar', length: 255, charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
    invitation_link: string;

    @CreateDateColumn({ type: 'datetime' })
    created_at: Date;

    @UpdateDateColumn({ type: 'datetime', nullable: true })
    updated_at: Date | null;
}

@Entity('trip_detail')
export class TripDetail {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @ManyToOne(() => Trips, (Trip) => Trip.trip_id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trip_id' })
    tripId: Trips;
    @Column({ type: 'int', unsigned: true })
    trip_id: number;

    @ManyToOne(() => Users, (user) => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: Users;
    @Column({ type: 'int', unsigned: true })
    user_id: number;

    @Column({ type: 'datetime'})
    schedule_time: Date;

    @Column({ type: 'varchar', length: 255, charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
    schedule_title: string;

    @CreateDateColumn({ type: 'datetime' })
    created_at: Date;

    @UpdateDateColumn({ type: 'datetime', nullable: true })
    updated_at: Date | null;
}

@Entity('participant')
export class Participant {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @ManyToOne(() => Trips, (Trip) => Trip.trip_id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trip_id' })
    tripId: Trips;
    @Column({ type: 'int', unsigned: true })
    trip_id: number;

    @ManyToOne(() => Users, (user) => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: Users;
    @Column({ type: 'int', unsigned: true })
    user_id: number;

    @Column({ type: 'varchar', length: 255, charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
    role: string;

    @Column({ type: 'datetime'})
    invited_at: Date;

    @Column({ type: 'datetime'})
    accepted_at: Date;
}