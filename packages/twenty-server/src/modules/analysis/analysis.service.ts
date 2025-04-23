import { Injectable, Logger } from '@nestjs/common';

import { resumeAnalysisAgent } from '../../../lib/agents/resume-analyzer';
import { supabase } from '../../../supabase/config';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  async analyzeApplication(applicationId: string) {
    // Fetch application with candidate resume and job requirements
    const { data: application, error: appError } = await supabase
      .from('giselle.applications')
      .select(
        `
        id,
        candidates:candidate_id (id, resume_text),
        jobs:job_id (id, requirements)
      `,
      )
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      this.logger.error(`Application not found: ${applicationId}`);
      throw new Error('Application not found');
    }

    const jobRequirements = application.jobs.requirements;
    const resumeText = application.candidates.resume_text;

    if (!resumeText) {
      this.logger.error(
        `No resume text available for application: ${applicationId}`,
      );
      throw new Error('No resume text available for analysis');
    }

    // Run LangGraph agent analysis
    const result = await resumeAnalysisAgent.invoke({
      resume: resumeText,
      jobRequirements: jobRequirements,
    });

    const candidateSkills = result.extractSkills.output;
    const matchResults = result.matchJobRequirements.output;
    const summary = result.generateSummary.output;

    // Update application with analysis results
    const { error: updateError } = await supabase
      .from('giselle.applications')
      .update({
        ai_score: matchResults.matchScore,
        ai_analysis: {
          skills: candidateSkills,
          matching: matchResults,
          summary: summary,
        },
      })
      .eq('id', applicationId);

    if (updateError) {
      this.logger.error(
        `Failed to update application analysis: ${applicationId}`,
        updateError,
      );
      throw new Error('Failed to update application with analysis');
    }

    return {
      score: matchResults.matchScore,
      summary,
      analysis: {
        skills: candidateSkills,
        matching: matchResults,
      },
    };
  }
}
