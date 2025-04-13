import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity('candidate')
export class CandidateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column('text', { array: true, nullable: true })
  skills: string[];

  @Column({ nullable: true })
  experienceYears: number;

  @Column('jsonb', { nullable: true })
  resumeData: Record<string, any>;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}