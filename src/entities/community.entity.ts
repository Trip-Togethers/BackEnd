import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('posts')
export class Posts {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    
    user: User;
    @Column({ type: 'int', nullable: true })

    tripId?: number;

    @Column({ type: 'varchar', length: 255, charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
    postTitle: string;

    @Column({ nullable: true })
    postPhotoUrl: string;

    @Column({ type: 'text', charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
    postContent: string;

    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'datetime', nullable: true })
    updatedAt: Date | null;

    @OneToMany(() => Comments, (comment) => comment.postId)
    comments: Comments[];

    @OneToMany(() => Likes, (like) => like.postId)
    likes: Likes[];

    @Column()
    userId: number;
}

@Entity('comments')
export class Comments {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @ManyToOne(() => Posts, (post) => post.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'post_id' })
    postId!: number;

    @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User

    @Column()
    userId!: number;

    @Column({ type: 'text', charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
    content: string;

    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'datetime', nullable: true })
    updatedAt: Date | null;
}

@Entity('likes')
export class Likes {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @ManyToOne(() => Posts, (post) => post.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'post_id' })
    postId: number;

    @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    userId: number;

    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date;
}
