import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('job_posting')
export class JobPostingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column('text', { array: true, nullable: true, default: [] })
  requiredSkills: string[];

  @Column({ nullable: true })
  salaryRange: string;

  @Column({ default: 'active' })
  status: string;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}