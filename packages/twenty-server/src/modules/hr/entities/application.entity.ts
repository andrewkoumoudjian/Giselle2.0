import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { CandidateEntity } from './candidate.entity';
import { JobPostingEntity } from './job-posting.entity';

@Entity('application')
export class ApplicationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  candidateId: string;

  @ManyToOne(() => CandidateEntity)
  @JoinColumn({ name: 'candidateId' })
  candidate: CandidateEntity;

  @Column()
  jobPostingId: string;

  @ManyToOne(() => JobPostingEntity)
  @JoinColumn({ name: 'jobPostingId' })
  jobPosting: JobPostingEntity;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  matchScore: number;

  @Column('jsonb', { nullable: true })
  coverLetter: Record<string, any>;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}