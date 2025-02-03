import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Invitaion {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    tripId: number;

    @Column()
    inviteCode!: string;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    invitedAt!: Date;

    @Column()
    createLinkUser!: number;
}