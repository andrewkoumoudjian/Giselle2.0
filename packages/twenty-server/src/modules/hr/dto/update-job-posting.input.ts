import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsDate, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateJobPostingInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  requiredSkills?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  salaryRange?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  jobType?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  closingDate?: Date;
}