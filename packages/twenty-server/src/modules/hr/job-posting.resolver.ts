import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserContext } from 'src/decorators/user-context.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { CreateJobPostingInput } from './dto/create-job-posting.input';
import { UpdateJobPostingInput } from './dto/update-job-posting.input';
import { JobPostingEntity } from './job-posting.entity';
import { JobPostingService } from './job-posting.service';

@UseGuards(AuthGuard)
@Resolver(() => JobPostingEntity)
export class JobPostingResolver {
  constructor(private readonly jobPostingService: JobPostingService) {}

  @Query(() => [JobPostingEntity])
  async getJobPostings(
    @UserContext() userContext: { workspaceId: string },
  ) {
    return this.jobPostingService.findAll(userContext.workspaceId);
  }

  @Query(() => JobPostingEntity)
  async getJobPostingById(
    @Args('id') id: string,
    @UserContext() userContext: { workspaceId: string },
  ) {
    return this.jobPostingService.findById(id, userContext.workspaceId);
  }

  @Mutation(() => JobPostingEntity)
  async createJobPosting(
    @Args('data') data: CreateJobPostingInput,
    @UserContext() userContext: { workspaceId: string; userId: string },
  ) {
    return this.jobPostingService.create(data, userContext.workspaceId, userContext.userId);
  }

  @Mutation(() => JobPostingEntity)
  async updateJobPosting(
    @Args('id') id: string,
    @Args('data') data: UpdateJobPostingInput,
    @UserContext() userContext: { workspaceId: string },
  ) {
    return this.jobPostingService.update(id, data, userContext.workspaceId);
  }

  @Mutation(() => Boolean)
  async deleteJobPosting(
    @Args('id') id: string,
    @UserContext() userContext: { workspaceId: string },
  ) {
    return this.jobPostingService.delete(id, userContext.workspaceId);
  }
}