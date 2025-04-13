# HR Platform System Design Document

## Implementation Approach

### Architecture Overview
We will build a hybrid architecture combining Twenty CRM's capabilities with custom AI features, deployed on Vercel and Supabase. The system will use a microservices-based approach to separate concerns and enable independent scaling.

### Technology Stack
- **Frontend**: Next.js with React 18, TypeScript, Chakra UI, Tailwind CSS
- **Backend**: Serverless functions (Vercel), NestJS (Twenty CRM)
- **Database**: Supabase (PostgreSQL)
- **AI Services**: OpenAI API, ElevenLabs API
- **Message Queue**: Upstash Redis (replacing BullMQ)

### Integration Strategy

#### 1. Twenty CRM Integration
- Fork the Twenty CRM repository
- Modify the database configuration to use Supabase
- Adapt background jobs to use Upstash Redis
- Implement custom APIs for HR-specific features

#### 2. Serverless Adaptation

**BullMQ Replacement Strategy:**
1. Replace BullMQ with Upstash Redis Queue
2. Use Vercel Cron Jobs for scheduled tasks
3. Implement webhook-based event processing
4. Use Vercel Edge Functions for real-time features

**Database Adaptation:**
1. Move from direct PostgreSQL to Supabase
2. Use Supabase Row Level Security (RLS)
3. Implement real-time subscriptions

#### 3. AI Services Integration

**OpenAI Integration:**
- Resume parsing and analysis
- Skill matching algorithms
- Interview question generation
- Response analysis

**ElevenLabs Integration:**
- Voice synthesis for interviews
- Real-time voice processing
- Audio transcription

### Security Considerations

1. **Authentication & Authorization**
   - JWT-based authentication via Supabase Auth
   - Role-based access control (RBAC)
   - API key rotation for third-party services

2. **Data Protection**
   - End-to-end encryption for sensitive data
   - Row Level Security in Supabase
   - Regular security audits

3. **API Security**
   - Rate limiting
   - Request validation
   - CORS configuration
   - API key management

## Data Structures and Interfaces

### Database Schema Modifications

The following schema extends Twenty CRM's base schema with HR-specific tables:

```sql
-- Extended schema for HR platform
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users,
    resume_data JSONB,
    skills TEXT[],
    experience_years INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    required_skills TEXT[],
    salary_range NUMRANGE,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id),
    job_id UUID REFERENCES job_postings(id),
    status TEXT,
    match_score FLOAT,
    interview_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id),
    scheduled_time TIMESTAMPTZ,
    interview_type TEXT,
    ai_feedback JSONB,
    recording_url TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Design

We will implement a RESTful API with the following main endpoints:

```typescript
// Candidate Management
POST   /api/candidates               // Create candidate profile
GET    /api/candidates/:id           // Get candidate details
PUT    /api/candidates/:id           // Update candidate profile
POST   /api/candidates/:id/resume    // Upload resume

// Job Management
POST   /api/jobs                    // Create job posting
GET    /api/jobs                    // List job postings
GET    /api/jobs/:id                // Get job details
PUT    /api/jobs/:id                // Update job posting
DELETE /api/jobs/:id                // Delete job posting

// Application Management
POST   /api/applications            // Submit application
GET    /api/applications/:id        // Get application details
PUT    /api/applications/:id/status // Update application status

// Interview Management
POST   /api/interviews              // Schedule interview
GET    /api/interviews/:id          // Get interview details
POST   /api/interviews/:id/feedback // Submit AI feedback

// AI Services
POST   /api/ai/analyze-resume       // Analyze resume
POST   /api/ai/match-job            // Match candidate with job
POST   /api/ai/generate-questions   // Generate interview questions
```

## Program Call Flow

Key workflows include:

1. **Candidate Application Process**
2. **Job Posting Creation**
3. **Interview Scheduling and Execution**
4. **AI-based Matching and Analysis**

The detailed sequence diagrams will be provided in a separate file.

## Anything Unclear

1. **Performance Requirements**
   - Need to establish specific performance metrics for AI processing time
   - Define concurrent user load expectations

2. **Integration Limits**
   - Verify Twenty CRM API rate limits
   - Determine OpenAI API usage limits

3. **Data Retention**
   - Establish data retention policies for candidate data
   - Define video interview storage duration

4. **Compliance Requirements**
   - Verify GDPR compliance requirements
   - Confirm AI fairness regulations
