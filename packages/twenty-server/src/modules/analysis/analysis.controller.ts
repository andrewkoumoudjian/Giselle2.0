import { Controller, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

@Controller('applications')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post(':id/analyze')
  async analyzeApplication(@Param('id') id: string) {
    try {
      const result = await this.analysisService.analyzeApplication(id);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}