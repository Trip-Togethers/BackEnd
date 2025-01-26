import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Users } from './user.entity';

@Entity('posts')
export class Posts {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @ManyToOne(() => Users, (user) => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    @Column({ type: 'int', unsigned: true })
    user_id: Users;

    @Column({ type: 'int' })
    trip_id: number;

    @Column({ type: 'varchar', length: 255, charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
    post_title: string;

    @Column({ type: 'varchar', length: 255, charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
    post_photo_url: string;

    @Column({ type: 'text', charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
    post_content: string;

    @CreateDateColumn({ type: 'datetime' })
    created_at: Date;

    @UpdateDateColumn({ type: 'datetime', nullable: true })
    updated_at: Date | null;

    @OneToMany(() => Comments, (comment) => comment.post_id)
    comments: Comments[];

    @OneToMany(() => Likes, (like) => like.post_id)
    likes: Likes[];
}

@Entity('comments')
export class Comments {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @ManyToOne(() => Posts, (post) => post.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'post_id' })
    @Column({ type: 'int', unsigned: true })
    post_id: number;

    @ManyToOne(() => Users, (user) => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: Users
    @Column({ type: 'int', unsigned: true })
    user_id: number;

    @Column({ type: 'text', charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
    content: string;

    @CreateDateColumn({ type: 'datetime' })
    created_at: Date;

    @UpdateDateColumn({ type: 'datetime', nullable: true })
    updated_at: Date | null;
}

@Entity('likes')
export class Likes {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @ManyToOne(() => Posts, (post) => post.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'post_id' })
    @Column({ type: 'int', unsigned: true })
    post_id: number;

    @ManyToOne(() => Users, (user) => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    @Column({ type: 'int', unsigned: true })
    user_id: number;

    @CreateDateColumn({ type: 'datetime' })
    created_at: Date;
}
