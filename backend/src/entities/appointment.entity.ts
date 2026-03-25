import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Business } from "./business.entity.js";

@Entity("appointments")
export class Appointment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  businessId: string;

  @ManyToOne(() => Business)
  @JoinColumn({ name: "businessId" })
  business: Business;

  @Column()
  clientName: string;

  @Column({ nullable: true })
  clientEmail: string;

  @Column({ nullable: true })
  clientPhone: string;

  @Column({ nullable: true, type: "text" })
  note: string;

  @Column({ type: "date" })
  date: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @CreateDateColumn()
  createdAt: Date;
}
