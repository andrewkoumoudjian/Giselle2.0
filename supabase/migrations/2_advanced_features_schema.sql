-- Migration for advanced features: candidate comparison, analytics, email notifications, feedback

CREATE TABLE giselle.candidate_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_a_id UUID REFERENCES giselle.candidates(id) ON DELETE CASCADE,
  candidate_b_id UUID REFERENCES giselle.candidates(id) ON DELETE CASCADE,
  comparison_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE giselle.analytics_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE giselle.email_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL -- e.g. 'sent', 'failed'
);

CREATE TABLE giselle.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES giselle.applications(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  submitted_by TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);