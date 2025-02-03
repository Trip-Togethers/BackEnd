import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Invitaion {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    tripId: number;

    @Column()
    link!: string;

    @Column()
    invitedAt!: Date;

    @Column()
    createLinkUser!: string;
}