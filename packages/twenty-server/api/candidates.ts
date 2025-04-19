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
          return getCandidateById(req, res);
        }
        return getAllCandidates(req, res);

      case 'POST':
        return createCandidate(req, res);

      case 'PUT':
        return updateCandidate(req, res);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get all candidates
async function getAllCandidates(req: VercelRequest, res: VercelResponse) {
  const { data, error } = await supabase
    .from('candidates')
    .select('*');

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  return res.status(200).json(data);
}

// Get candidate by ID
async function getCandidateById(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  if (!data) {
    return res.status(404).json({ error: 'Candidate not found' });
  }
  
  return res.status(200).json(data);
}

// Create new candidate
async function createCandidate(req: VercelRequest, res: VercelResponse) {
  const { user_id, resume_data, skills, experience_years } = req.body;
  
  // Validate required fields
  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  const { data, error } = await supabase
    .from('candidates')
    .insert({
      user_id,
      resume_data,
      skills,
      experience_years,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  // Queue resume analysis
  // In a serverless environment, we would use Upstash Redis Queue here
  
  return res.status(201).json(data);
}

// Update candidate
async function updateCandidate(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  const { resume_data, skills, experience_years } = req.body;
  
  const { data, error } = await supabase
    .from('candidates')
    .update({
      resume_data,
      skills,
      experience_years,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  if (!data) {
    return res.status(404).json({ error: 'Candidate not found' });
  }
  
  return res.status(200).json(data);
} 