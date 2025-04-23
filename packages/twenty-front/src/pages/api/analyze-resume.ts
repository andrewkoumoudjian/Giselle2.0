import { NextApiRequest, NextApiResponse } from 'next';
import { resumeAnalysisAgent } from '../../../lib/agents/resume-analyzer';
import { supabase } from '../../../supabase/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { applicationId } = req.body;

    // Get application details with resume and job requirements
    const { data: application, error: appError } = await supabase
      .from('giselle.applications')
      .select(`
        id,
        candidates:candidate_id (id, resume_text),
        jobs:job_id (id, requirements)
      `)
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Parse the requirements and resume text
    const jobRequirements = application.jobs.requirements;
    const resumeText = application.candidates.resume_text;

    if (!resumeText) {
      return res.status(400).json({ message: 'No resume text available for analysis' });
    }

    // Run the LangGraph agent
    const result = await resumeAnalysisAgent.invoke({
      resume: resumeText,
      jobRequirements: jobRequirements,
    });

    // Extract the skills and analysis data
    const candidateSkills = result.extractSkills.output;
    const matchResults = result.matchJobRequirements.output;
    const summary = result.generateSummary.output;

    // Update the application with the analysis results
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
      console.error('Error updating application:', updateError);
      return res.status(500).json({ message: 'Failed to update application with analysis' });
    }

    return res.status(200).json({
      message: 'Resume analysis complete',
      score: matchResults.matchScore,
      summary: summary,
      analysis: {
        skills: candidateSkills,
        matching: matchResults,
      },
    });
  } catch (error) {
    console.error('Error in resume analysis:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}