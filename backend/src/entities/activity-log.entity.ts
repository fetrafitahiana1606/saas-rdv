import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("activity_logs")
export class ActivityLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  businessId: string;

  @Column({ nullable: true })
  userId: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  targetType: string;

  @Column({ nullable: true })
  targetId: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}
