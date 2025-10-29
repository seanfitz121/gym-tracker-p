-- Create data_requests table for GDPR compliance
CREATE TABLE IF NOT EXISTS data_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'deletion')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  export_url TEXT, -- For data export requests, store the URL to download
  CONSTRAINT valid_dates CHECK (
    (processed_at IS NULL OR processed_at >= created_at) AND
    (completed_at IS NULL OR completed_at >= created_at)
  )
);

-- Create indexes for efficient queries
CREATE INDEX idx_data_requests_user_id ON data_requests(user_id);
CREATE INDEX idx_data_requests_status ON data_requests(status);
CREATE INDEX idx_data_requests_created_at ON data_requests(created_at DESC);
CREATE INDEX idx_data_requests_user_status ON data_requests(user_id, status);

-- Enable RLS
ALTER TABLE data_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data requests
CREATE POLICY "Users can view their own data requests"
  ON data_requests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own data requests"
  ON data_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: Only admin/server can UPDATE or DELETE data requests
-- This prevents users from tampering with request status

-- Add comment
COMMENT ON TABLE data_requests IS 'Stores user requests for data export and account deletion (GDPR compliance)';
COMMENT ON COLUMN data_requests.request_type IS 'Type of request: export or deletion';
COMMENT ON COLUMN data_requests.status IS 'Status: pending, processing, completed, or failed';
COMMENT ON COLUMN data_requests.export_url IS 'For export requests, the URL where the user can download their data';

