import { createClient } from '@supabase/supabase-js';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase client
const supabaseUrl = process.env.POSTGRES_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle different API methods
  try {
    switch (req.method) {
      case 'GET':
        if (req.query.id) {
          return getInterviewById(req, res);
        }
        return getInterviews(req, res);

      case 'POST':
        if (req.query.id && req.query.action === 'feedback') {
          return submitAIFeedback(req, res);
        }
        return scheduleInterview(req, res);

      case 'PUT':
        return updateInterview(req, res);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get all interviews with optional filtering
async function getInterviews(req: VercelRequest, res: VercelResponse) {
  const { application_id, status, scheduled_after, scheduled_before } = req.query;
  
  let query = supabase.from('interviews').select(`
    *,
    applications!interviews_application_id_fkey(
      *,
      candidates(*),
      job_postings(*)
    )
  `);
  
  // Add filters if provided
  if (application_id) {
    query = query.eq('application_id', application_id);
  }
  
  if (status) {
    query = query.eq('status', status);
  }
  
  if (scheduled_after) {
    query = query.gte('scheduled_time', scheduled_after);
  }
  
  if (scheduled_before) {
    query = query.lte('scheduled_time', scheduled_before);
  }
  
  // Order by scheduled time
  query = query.order('scheduled_time', { ascending: true });
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  return res.status(200).json(data);
}

// Get interview by ID
async function getInterviewById(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  
  const { data, error } = await supabase
    .from('interviews')
    .select(`
      *,
      applications!interviews_application_id_fkey(
        *,
        candidates(*),
        job_postings(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  if (!data) {
    return res.status(404).json({ error: 'Interview not found' });
  }
  
  return res.status(200).json(data);
}

// Schedule a new interview
async function scheduleInterview(req: VercelRequest, res: VercelResponse) {
  const { application_id, scheduled_time, interview_type } = req.body;
  
  // Validate required fields
  if (!application_id || !scheduled_time || !interview_type) {
    return res.status(400).json({ 
      error: 'Application ID, scheduled time, and interview type are required'
    });
  }
  
  // Check if application exists
  const { data: applicationData, error: applicationError } = await supabase
    .from('applications')
    .select('id, status')
    .eq('id', application_id)
    .single();
    
  if (applicationError || !applicationData) {
    return res.status(400).json({ error: 'Invalid application ID' });
  }
  
  // Validate interview type
  const validTypes = ['initial', 'technical', 'culture', 'final'];
  if (!validTypes.includes(interview_type)) {
    return res.status(400).json({ 
      error: 'Invalid interview type',
      valid_types: validTypes
    });
  }
  
  // Create the interview
  const { data, error } = await supabase
    .from('interviews')
    .insert({
      application_id,
      scheduled_time,
      interview_type,
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  // Update application status to 'interviewing'
  await supabase
    .from('applications')
    .update({
      status: 'interviewing',
      updated_at: new Date().toISOString()
    })
    .eq('id', application_id);
  
  // TODO: Queue AI to generate interview questions
  
  return res.status(201).json(data);
}

// Update interview details
async function updateInterview(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  const { scheduled_time, status, recording_url } = req.body;
  
  // Validate status
  const validStatuses = ['scheduled', 'in-progress', 'completed', 'canceled'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status',
      valid_statuses: validStatuses
    });
  }
  
  const updateData: any = {
    updated_at: new Date().toISOString()
  };
  
  if (scheduled_time) updateData.scheduled_time = scheduled_time;
  if (status) updateData.status = status;
  if (recording_url) updateData.recording_url = recording_url;
  
  const { data, error } = await supabase
    .from('interviews')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  if (!data) {
    return res.status(404).json({ error: 'Interview not found' });
  }
  
  // If status is 'completed', trigger AI analysis
  if (status === 'completed' && recording_url) {
    // TODO: Queue AI analysis of the interview
  }
  
  return res.status(200).json(data);
}

// Submit AI feedback for an interview
async function submitAIFeedback(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  const { ai_feedback } = req.body;
  
  if (!ai_feedback) {
    return res.status(400).json({ error: 'AI feedback is required' });
  }
  
  const { data, error } = await supabase
    .from('interviews')
    .update({
      ai_feedback,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  if (!data) {
    return res.status(404).json({ error: 'Interview not found' });
  }
  
  // Get the application for this interview
  const { data: applicationData } = await supabase
    .from('applications')
    .select('id, job_id, candidate_id')
    .eq('id', data.application_id)
    .single();
  
  if (applicationData) {
    // TODO: Update Twenty CRM pipeline with interview results
  }
  
  return res.status(200).json(data);
} 