import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('job_postings')
@ObjectType()
export class JobPosting {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  title: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  @Field(() => [String], { nullable: true })
  requiredSkills: string[];

  @Column({ nullable: true })
  @Field({ nullable: true })
  salaryMin: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  salaryMax: number;

  @Column({ default: 'draft' })
  @Field()
  status: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  location: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  jobType: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  experienceLevel: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  department: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}