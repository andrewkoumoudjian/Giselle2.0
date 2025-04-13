import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from 'src/database/base.entity';
import { WorkspaceMemberEntity } from 'src/modules/workspace-member/workspace-member.entity';
import { ApplicationEntity } from './application.entity';

@Entity('job_posting')
@ObjectType('JobPosting')
export class JobPostingEntity extends BaseEntity {
  @Field(() => String)
  @Column()
  title: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'text' })
  description: string;

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  requiredSkills: string[];

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  salaryRange: string;

  @Field(() => String)
  @Column({ default: 'active' })
  status: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  location: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  jobType: string;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  closingDate: Date;

  @Field(() => WorkspaceMemberEntity)
  @ManyToOne(() => WorkspaceMemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  createdBy: WorkspaceMemberEntity;

  @Field(() => String)
  @Column()
  createdById: string;

  @OneToMany(() => ApplicationEntity, (application) => application.jobPosting)
  applications: ApplicationEntity[];
}