import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum UserPlan {
  FREE = "free",
  PRO = "pro",
  BUSINESS = "business",
  TEAM = "team",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ unique: true, nullable: true })
  googleId: string;

  @Column({ type: "enum", enum: UserPlan, default: UserPlan.FREE })
  plan: UserPlan;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
