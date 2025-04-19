import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CandidatePersonMappingEntity } from '../entities/candidate-person-mapping.entity';

@Injectable()
export class CandidatePersonMappingService {
  constructor(
    @InjectRepository(CandidatePersonMappingEntity)
    private mappingRepository: Repository<CandidatePersonMappingEntity>,
  ) {}

  async findAll(): Promise<CandidatePersonMappingEntity[]> {
    return this.mappingRepository.find();
  }

  async findByCandidateId(candidateId: string): Promise<CandidatePersonMappingEntity> {
    const mapping = await this.mappingRepository.findOne({ where: { candidateId } });
    
    if (!mapping) {
      throw new NotFoundException(`No mapping found for candidate with ID ${candidateId}`);
    }
    
    return mapping;
  }

  async findByPersonId(personId: string): Promise<CandidatePersonMappingEntity[]> {
    return this.mappingRepository.find({ where: { personId } });
  }

  async create(mappingData: { candidateId: string; personId: string }): Promise<CandidatePersonMappingEntity> {
    // Check if mapping already exists
    const existingMapping = await this.mappingRepository.findOne({ 
      where: { candidateId: mappingData.candidateId } 
    });
    
    if (existingMapping) {
      // Update the existing mapping
      existingMapping.personId = mappingData.personId;
      existingMapping.updatedAt = new Date();
      return this.mappingRepository.save(existingMapping);
    }
    
    // Create a new mapping
    const mapping = this.mappingRepository.create(mappingData);
    return this.mappingRepository.save(mapping);
  }

  async delete(candidateId: string): Promise<void> {
    const result = await this.mappingRepository.delete({ candidateId });
    
    if (result.affected === 0) {
      throw new NotFoundException(`No mapping found for candidate with ID ${candidateId}`);
    }
  }
} 