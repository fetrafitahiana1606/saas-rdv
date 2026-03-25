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
      `'{"monday":{"start":"09:00","end":"17:00","enabled":true},"tuesday":{"start":"09:00","end":"17:00","enabled":true},"wednesday":{"start":"09:00","end":"17:00","enabled":true},"thursday":{"start":"09:00","end":"17:00","enabled":true},"friday":{"start":"09:00","end":"17:00","enabled":true},"saturday":{"start":"09:00","end":"12:00","enabled":false},"sunday":{"start":"09:00","end":"12:00","enabled":false}}'`,
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
