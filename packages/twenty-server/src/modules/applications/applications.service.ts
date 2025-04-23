import { Injectable, Logger } from '@nestjs/common';

import { supabase } from '@twenty-shared/supabaseClient';

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
}
