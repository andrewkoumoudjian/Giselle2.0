import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ApplicationEntity } from './application.entity';

@Entity('interview')
export class InterviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  applicationId: string;

  @ManyToOne(() => ApplicationEntity)
  @JoinColumn({ name: 'applicationId' })
  application: ApplicationEntity;

  @Column('timestamp with time zone')
  scheduledAt: Date;

  @Column({ nullable: true })
  interviewerUserId: string;

  @Column({ default: 'scheduled' })
  status: string;

  @Column('jsonb', { nullable: true })
  questions: {
    id: string;
    question: string;
    response?: string;
    score?: number;
  }[];

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  overallScore: number;

  @Column({ nullable: true })
  feedback: string;

  @Column({ nullable: true })
  recordingUrl: string;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}