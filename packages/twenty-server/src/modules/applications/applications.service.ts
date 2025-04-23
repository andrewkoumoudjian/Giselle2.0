import { Injectable, Logger } from '@nestjs/common';

import { supabase } from 'twenty-shared/src/supabaseClient';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  async getApplications() {
    const { data, error } = await supabase
      .from('giselle.applications')
      .select(
        `
        id,
        status,
        ai_score,
        ai_analysis,
        created_at,
        candidate:candidate_id (id, first_name, last_name, email, resume_url),
        job:job_id (id, title)
      `,
      )
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Error fetching applications', error);
      throw new Error('Failed to fetch applications');
    }

    return data;
  }

  // Add scheduleInterview method to support interview scheduling
  async scheduleInterview(
    applicationId: string,
    scheduleDto: { date: string; time: string; mode: string },
  ): Promise<any> {
    // Placeholder implementation: log and return success
    console.log(
      `Scheduling interview for application ${applicationId} with details:`,
      scheduleDto,
    );

    return { success: true, message: 'Interview scheduled (mock)' };
  }

  // Compare two candidates and return comparison result
  async candidateComparison(candidateAId: string, candidateBId: string) {
    // Placeholder: fetch candidates and compare their skills
    const { data: candidateA, error: errorA } = await supabase
      .from('giselle.candidates')
      .select('id, first_name, last_name, skills')
      .eq('id', candidateAId)
      .single();

    const { data: candidateB, error: errorB } = await supabase
      .from('giselle.candidates')
      .select('id, first_name, last_name, skills')
      .eq('id', candidateBId)
      .single();

    if (errorA || errorB) {
      this.logger.error('Error fetching candidates for comparison', {
        errorA,
        errorB,
      });
      throw new Error('Failed to fetch candidates for comparison');
    }

    // Simple skill comparison logic (placeholder)
    const skillsA = candidateA.skills || [];
    const skillsB = candidateB.skills || [];

    const commonSkills = skillsA.filter((skill) => skillsB.includes(skill));

    return {
      candidateA,
      candidateB,
      commonSkills,
      comparisonSummary: `Candidates share ${commonSkills.length} common skills.`,
    };
  }

  // Retrieve analytics data for dashboard
  async getAnalyticsData() {
    const { data, error } = await supabase
      .from('giselle.analytics_data')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(100);

    if (error) {
      this.logger.error('Error fetching analytics data', error);
      throw new Error('Failed to fetch analytics data');
    }

    return data;
  }

  // Send email notification (mock implementation)
  async sendEmailNotification(
    recipientEmail: string,
    subject: string,
    body: string,
  ) {
    // In real implementation, integrate with email service
    this.logger.log(
      `Sending email to ${recipientEmail} with subject '${subject}'`,
    );

    // Save notification record
    const { error } = await supabase
      .from('giselle.email_notifications')
      .insert({
        recipient_email: recipientEmail,
        subject,
        body,
        sent_at: new Date().toISOString(),
        status: 'sent',
      });

    if (error) {
      this.logger.error('Error saving email notification', error);
      throw new Error('Failed to save email notification');
    }

    return { success: true, message: 'Email sent (mock)' };
  }

  // Collect feedback for an application
  async collectFeedback(
    applicationId: string,
    feedbackText: string,
    submittedBy: string,
  ) {
    const { error } = await supabase.from('giselle.feedback').insert({
      application_id: applicationId,
      feedback_text: feedbackText,
      submitted_by: submittedBy,
      submitted_at: new Date().toISOString(),
    });

    if (error) {
      this.logger.error('Error saving feedback', error);
      throw new Error('Failed to save feedback');
    }

    return { success: true, message: 'Feedback submitted' };
  }
}
