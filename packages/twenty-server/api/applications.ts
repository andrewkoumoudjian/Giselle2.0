import { createClient } from '@supabase/supabase-js';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
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
          return getApplicationById(req, res);
        }
        return getAllApplications(req, res);

      case 'POST':
        return submitApplication(req, res);

      case 'PUT':
        return updateApplicationStatus(req, res);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get all applications with optional filtering
async function getAllApplications(req: VercelRequest, res: VercelResponse) {
  const { candidate_id, job_id, status } = req.query;
  
  let query = supabase.from('applications').select(`
    *,
    candidates(*),
    job_postings(*)
  `);
  
  // Add filters if provided
  if (candidate_id) {
    query = query.eq('candidate_id', candidate_id);
  }
  
  if (job_id) {
    query = query.eq('job_id', job_id);
  }
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  return res.status(200).json(data);
}

// Get application by ID
async function getApplicationById(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      candidates(*),
      job_postings(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  if (!data) {
    return res.status(404).json({ error: 'Application not found' });
  }
  
  return res.status(200).json(data);
}

// Submit new application
async function submitApplication(req: VercelRequest, res: VercelResponse) {
  const { candidate_id, job_id, cover_letter } = req.body;
  
  // Validate required fields
  if (!candidate_id || !job_id) {
    return res.status(400).json({ error: 'Candidate ID and Job ID are required' });
  }
  
  // Check if candidate exists
  const { data: candidateData, error: candidateError } = await supabase
    .from('candidates')
    .select('id')
    .eq('id', candidate_id)
    .single();
    
  if (candidateError || !candidateData) {
    return res.status(400).json({ error: 'Invalid candidate ID' });
  }
  
  // Check if job exists
  const { data: jobData, error: jobError } = await supabase
    .from('job_postings')
    .select('id')
    .eq('id', job_id)
    .single();
    
  if (jobError || !jobData) {
    return res.status(400).json({ error: 'Invalid job ID' });
  }
  
  // Check if application already exists
  const { data: existingApp, error: existingAppError } = await supabase
    .from('applications')
    .select('id')
    .eq('candidate_id', candidate_id)
    .eq('job_id', job_id)
    .maybeSingle();
    
  if (existingApp) {
    return res.status(409).json({ 
      error: 'Application already exists', 
      application_id: existingApp.id
    });
  }
  
  // Create the application
  const { data, error } = await supabase
    .from('applications')
    .insert({
      candidate_id,
      job_id,
      status: 'pending',
      interview_data: { cover_letter },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  // TODO: Queue AI matching process to calculate match_score
  
  return res.status(201).json(data);
}

// Update application status
async function updateApplicationStatus(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  const { status, interview_data, match_score } = req.body;
  
  // Validate status
  const validStatuses = ['pending', 'reviewing', 'interviewing', 'rejected', 'hired'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status',
      valid_statuses: validStatuses
    });
  }
  
  const updateData: any = {
    updated_at: new Date().toISOString()
  };
  
  if (status) updateData.status = status;
  if (interview_data) updateData.interview_data = interview_data;
  if (match_score !== undefined) updateData.match_score = match_score;
  
  const { data, error } = await supabase
    .from('applications')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  if (!data) {
    return res.status(404).json({ error: 'Application not found' });
  }
  
  return res.status(200).json(data);
} 