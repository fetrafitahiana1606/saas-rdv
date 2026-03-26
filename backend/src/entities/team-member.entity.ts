import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity.js";
import { Business } from "./business.entity.js";

export enum TeamRole {
  ADMIN = "admin",
  SECRETARY = "secretary",
  READONLY = "readonly",
}

@Entity("team_members")
export class TeamMember {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  businessId: string;

  @ManyToOne(() => Business)
  @JoinColumn({ name: "businessId" })
  business: Business;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "enum", enum: TeamRole, default: TeamRole.READONLY })
  role: TeamRole;

  @Column({ type: "uuid", nullable: true })
  invitedBy: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  invitedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
