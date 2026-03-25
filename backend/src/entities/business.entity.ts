import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity.js";

@Entity("businesses")
export class Business {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ default: "Mon établissement" })
  businessName: string;

  @Column({ default: "Consultation" })
  serviceType: string;

  @Column({ default: "#3b82f6" })
  primaryColor: string;

  @Column({ unique: true })
  slug: string;

  @Column({
    type: "jsonb",
    default: () =>
      `'{"lundi":{"start":"09:00","end":"17:00","enabled":true},"mardi":{"start":"09:00","end":"17:00","enabled":true},"mercredi":{"start":"09:00","end":"17:00","enabled":true},"jeudi":{"start":"09:00","end":"17:00","enabled":true},"vendredi":{"start":"09:00","end":"17:00","enabled":true},"samedi":{"start":"09:00","end":"12:00","enabled":false},"dimanche":{"start":"09:00","end":"12:00","enabled":false}}'`,
  })
  hours: Record<string, { start: string; end: string; enabled: boolean }>;

  @Column({ default: 30 })
  slotDuration: number;

  @Column({
    type: "jsonb",
    default: () => `'{"phone":true,"email":true,"note":true}'`,
  })
  formFields: { phone: boolean; email: boolean; note: boolean };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
