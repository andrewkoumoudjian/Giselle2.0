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
          return getJobById(req, res);
        }
        return getAllJobs(req, res);

      case 'POST':
        return createJob(req, res);

      case 'PUT':
        return updateJob(req, res);

      case 'DELETE':
        return deleteJob(req, res);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get all jobs
async function getAllJobs(req: VercelRequest, res: VercelResponse) {
  const { status } = req.query;
  
  let query = supabase.from('job_postings').select('*');
  
  // Add filter by status if provided
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  return res.status(200).json(data);
}

// Get job by ID
async function getJobById(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  
  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  if (!data) {
    return res.status(404).json({ error: 'Job posting not found' });
  }
  
  return res.status(200).json(data);
}

// Create new job posting
async function createJob(req: VercelRequest, res: VercelResponse) {
  const { title, description, required_skills, salary_range, status } = req.body;
  
  // Validate required fields
  if (!title) {
    return res.status(400).json({ error: 'Job title is required' });
  }
  
  const { data, error } = await supabase
    .from('job_postings')
    .insert({
      title,
      description,
      required_skills,
      salary_range,
      status: status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  return res.status(201).json(data);
}

// Update job posting
async function updateJob(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  const { title, description, required_skills, salary_range, status } = req.body;
  
  const { data, error } = await supabase
    .from('job_postings')
    .update({
      title,
      description,
      required_skills,
      salary_range,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  if (!data) {
    return res.status(404).json({ error: 'Job posting not found' });
  }
  
  return res.status(200).json(data);
}

// Delete job posting
async function deleteJob(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  
  const { error } = await supabase
    .from('job_postings')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  return res.status(204).end();
} 