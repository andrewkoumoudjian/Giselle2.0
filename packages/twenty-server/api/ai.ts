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

  // Only allow POST requests for AI endpoints
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Handle different AI endpoints
  try {
    const endpoint = req.query.endpoint as string;
    
    switch (endpoint) {
      case 'analyze-resume':
        return analyzeResume(req, res);
        
      case 'match-job':
        return matchCandidateToJob(req, res);
        
      case 'generate-questions':
        return generateInterviewQuestions(req, res);
        
      default:
        return res.status(404).json({ error: 'AI endpoint not found' });
    }
  } catch (error) {
    console.error('AI API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Analyze a candidate's resume
async function analyzeResume(req: VercelRequest, res: VercelResponse) {
  const { candidate_id, resume_text } = req.body;
  
  if (!candidate_id || !resume_text) {
    return res.status(400).json({ error: 'Candidate ID and resume text are required' });
  }
  
  try {
    // This is where you would integrate with OpenAI/OpenRouter API
    // For now, we'll simulate the AI analysis
    const skills = extractSkillsFromResume(resume_text);
    const experienceYears = estimateExperienceYears(resume_text);
    
    // Update the candidate record with extracted information
    const { data, error } = await supabase
      .from('candidates')
      .update({
        skills,
        experience_years: experienceYears,
        resume_data: {
          raw_text: resume_text,
          analysis_completed: true,
          extracted_skills: skills,
          experience_years: experienceYears
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', candidate_id)
      .select()
      .single();
      
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(200).json({
      candidate_id,
      skills,
      experience_years: experienceYears,
      analysis: {
        status: 'completed',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    return res.status(500).json({ error: 'Failed to analyze resume' });
  }
}

// Match a candidate to a specific job
async function matchCandidateToJob(req: VercelRequest, res: VercelResponse) {
  const { candidate_id, job_id } = req.body;
  
  if (!candidate_id || !job_id) {
    return res.status(400).json({ error: 'Candidate ID and Job ID are required' });
  }
  
  try {
    // Get candidate data
    const { data: candidateData, error: candidateError } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', candidate_id)
      .single();
      
    if (candidateError || !candidateData) {
      return res.status(400).json({ error: 'Invalid candidate ID' });
    }
    
    // Get job data
    const { data: jobData, error: jobError } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', job_id)
      .single();
      
    if (jobError || !jobData) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }
    
    // Check if an application already exists
    const { data: existingApp } = await supabase
      .from('applications')
      .select('id, match_score')
      .eq('candidate_id', candidate_id)
      .eq('job_id', job_id)
      .maybeSingle();
    
    // Calculate match score (this would be the AI model in production)
    const candidateSkills = candidateData.skills || [];
    const requiredSkills = jobData.required_skills || [];
    
    const matchScore = calculateMatchScore(candidateSkills, requiredSkills);
    const matchedSkills = findMatchedSkills(candidateSkills, requiredSkills);
    const missingSkills = findMissingSkills(candidateSkills, requiredSkills);
    const additionalSkills = findAdditionalSkills(candidateSkills, requiredSkills);
    
    const matchData = {
      match_score: matchScore,
      matched_skills: matchedSkills,
      missing_skills: missingSkills,
      additional_skills: additionalSkills
    };
    
    // If application exists, update the match score
    if (existingApp) {
      await supabase
        .from('applications')
        .update({
          match_score: matchScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingApp.id);
        
      return res.status(200).json({
        application_id: existingApp.id,
        previous_score: existingApp.match_score,
        current_score: matchScore,
        ...matchData
      });
    }
    
    // Return match results
    return res.status(200).json({
      candidate_id,
      job_id,
      ...matchData
    });
  } catch (error) {
    console.error('Job matching error:', error);
    return res.status(500).json({ error: 'Failed to match candidate to job' });
  }
}

// Generate interview questions for a specific job and candidate
async function generateInterviewQuestions(req: VercelRequest, res: VercelResponse) {
  const { interview_id, count = 5 } = req.body;
  
  if (!interview_id) {
    return res.status(400).json({ error: 'Interview ID is required' });
  }
  
  try {
    // Get interview with application, candidate and job data
    const { data: interviewData, error: interviewError } = await supabase
      .from('interviews')
      .select(`
        *,
        applications!interviews_application_id_fkey(
          *,
          candidates(*),
          job_postings(*)
        )
      `)
      .eq('id', interview_id)
      .single();
      
    if (interviewError || !interviewData) {
      return res.status(400).json({ error: 'Invalid interview ID' });
    }
    
    const application = interviewData.applications;
    const candidate = application.candidates;
    const job = application.job_postings;
    const interviewType = interviewData.interview_type;
    
    // Generate questions based on job requirements and candidate profile
    // In production, this would call the LLM API
    const questions = generateQuestions(
      job.required_skills, 
      candidate.skills,
      interviewType,
      count
    );
    
    // Store questions in interview data
    await supabase
      .from('interviews')
      .update({
        ai_feedback: {
          ...interviewData.ai_feedback,
          generated_questions: questions
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', interview_id);
    
    return res.status(200).json({
      interview_id,
      questions,
      interview_type: interviewType
    });
  } catch (error) {
    console.error('Question generation error:', error);
    return res.status(500).json({ error: 'Failed to generate interview questions' });
  }
}

// Helper functions for AI simulation (would be replaced with actual AI calls)

// Extract skills from resume text
function extractSkillsFromResume(resumeText: string): string[] {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'REST API', 'GraphQL',
    'MongoDB', 'PostgreSQL', 'Redis', 'HTML', 'CSS', 'Git', 'CI/CD'
  ];
  
  const skills = commonSkills.filter(skill => 
    resumeText.toLowerCase().includes(skill.toLowerCase())
  );
  
  return skills;
}

// Estimate years of experience from resume text
function estimateExperienceYears(resumeText: string): number {
  // Simple heuristic - count the number of years mentioned
  const yearMatches = resumeText.match(/\d{4}/g) || [];
  const uniqueYears = [...new Set(yearMatches)].sort();
  
  if (uniqueYears.length >= 2) {
    const earliestYear = parseInt(uniqueYears[0]);
    const latestYear = parseInt(uniqueYears[uniqueYears.length - 1]);
    const currentYear = new Date().getFullYear();
    
    return Math.min(latestYear, currentYear) - earliestYear;
  }
  
  // Fallback: look for phrases like "X years of experience"
  const experienceMatch = resumeText.match(/(\d+)\s*(?:years?|yrs?)(?:\s+of)?\s+experience/i);
  if (experienceMatch) {
    return parseInt(experienceMatch[1]);
  }
  
  return 0; // Default if we can't determine
}

// Calculate match score based on skills overlap
function calculateMatchScore(candidateSkills: string[], requiredSkills: string[]): number {
  if (!requiredSkills.length) return 0;
  
  const normalizedCandidateSkills = candidateSkills.map(s => s.toLowerCase());
  const normalizedRequiredSkills = requiredSkills.map(s => s.toLowerCase());
  
  const matchedCount = normalizedRequiredSkills.filter(
    skill => normalizedCandidateSkills.includes(skill)
  ).length;
  
  return Math.round((matchedCount / normalizedRequiredSkills.length) * 100);
}

// Find skills that match between candidate and job
function findMatchedSkills(candidateSkills: string[], requiredSkills: string[]): string[] {
  const normalizedCandidateSkills = candidateSkills.map(s => s.toLowerCase());
  
  return requiredSkills.filter(
    skill => normalizedCandidateSkills.includes(skill.toLowerCase())
  );
}

// Find required skills that candidate is missing
function findMissingSkills(candidateSkills: string[], requiredSkills: string[]): string[] {
  const normalizedCandidateSkills = candidateSkills.map(s => s.toLowerCase());
  
  return requiredSkills.filter(
    skill => !normalizedCandidateSkills.includes(skill.toLowerCase())
  );
}

// Find additional skills the candidate has beyond requirements
function findAdditionalSkills(candidateSkills: string[], requiredSkills: string[]): string[] {
  const normalizedRequiredSkills = requiredSkills.map(s => s.toLowerCase());
  
  return candidateSkills.filter(
    skill => !normalizedRequiredSkills.includes(skill.toLowerCase())
  );
}

// Generate interview questions based on job requirements
function generateQuestions(
  requiredSkills: string[],
  candidateSkills: string[],
  interviewType: string,
  count: number
): string[] {
  const questions: string[] = [];
  const missingSkills = findMissingSkills(candidateSkills, requiredSkills);
  
  // Questions based on interview type
  if (interviewType === 'initial') {
    questions.push(
      "Tell me about your background and experience.",
      "Why are you interested in this position?",
      "What are you looking for in your next role?",
      "How did you hear about this position?",
      "What is your availability for starting a new position?"
    );
  } else if (interviewType === 'technical') {
    // Add questions about candidate's skills
    candidateSkills.slice(0, 3).forEach(skill => {
      questions.push(`Can you describe a project where you used ${skill}?`);
    });
    
    // Add questions about missing skills
    missingSkills.slice(0, 2).forEach(skill => {
      questions.push(`Though you haven't listed ${skill}, do you have any experience with it or similar technologies?`);
    });
    
    // Add general technical questions
    questions.push(
      "Describe a technical challenge you faced and how you solved it.",
      "How do you stay updated with the latest technologies in your field?"
    );
  } else if (interviewType === 'culture') {
    questions.push(
      "Describe your ideal work environment.",
      "How do you handle feedback?",
      "Tell me about a time you had a conflict with a team member and how you resolved it.",
      "What are your strengths and weaknesses?",
      "How do you prioritize tasks when you have multiple deadlines?"
    );
  } else if (interviewType === 'final') {
    questions.push(
      "Do you have any questions about the company or the role?",
      "What are your salary expectations?",
      "What is your notice period?",
      "Are you considering other opportunities?",
      "Is there anything else you'd like us to know about you?"
    );
  }
  
  // Return up to the requested number of questions
  return questions.slice(0, count);
} 