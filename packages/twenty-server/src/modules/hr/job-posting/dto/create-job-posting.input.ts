import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateJobPostingInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  requiredSkills: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  preferredSkills?: string[];

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  salaryMin?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  salaryMax?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  location?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  jobType?: string; // Full-time, Part-time, Contract, etc.
}