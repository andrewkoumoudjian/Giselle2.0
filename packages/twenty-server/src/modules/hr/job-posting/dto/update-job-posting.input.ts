import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateJobPostingInput } from './create-job-posting.input';

@InputType()
export class UpdateJobPostingInput extends PartialType(CreateJobPostingInput) {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id: string;
}