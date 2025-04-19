import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CandidatePersonMappingEntity } from '../entities/candidate-person-mapping.entity';
import { CandidatePersonMappingService } from '../services/candidate-person-mapping.service';

@Controller('api/hr/candidate-person-mappings')
export class CandidatePersonMappingController {
  constructor(private readonly mappingService: CandidatePersonMappingService) {}

  @Get()
  async findAll(): Promise<CandidatePersonMappingEntity[]> {
    return this.mappingService.findAll();
  }

  @Get(':candidateId')
  async findByCandidateId(@Param('candidateId') candidateId: string): Promise<CandidatePersonMappingEntity> {
    return this.mappingService.findByCandidateId(candidateId);
  }

  @Post()
  async create(
    @Body() mappingData: { candidateId: string; personId: string },
  ): Promise<CandidatePersonMappingEntity> {
    return this.mappingService.create(mappingData);
  }
} 