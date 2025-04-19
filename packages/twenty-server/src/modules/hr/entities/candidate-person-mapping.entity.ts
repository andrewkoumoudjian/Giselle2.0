import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CandidateEntity } from './candidate.entity';

@Entity('candidate_person_mapping')
export class CandidatePersonMappingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  candidateId: string;

  @ManyToOne(() => CandidateEntity)
  @JoinColumn({ name: 'candidateId' })
  candidate: CandidateEntity;

  @Column()
  personId: string;

  // Note: Cannot directly reference the Person entity from CRM 
  // since it's in a different module, but we store the ID

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 