-- Migration 001: Create PRP tables for YouTube PRP Parser
-- This migration creates the necessary tables for storing parsed PRPs and tasks

-- Create parsed_prps table to store YouTube video PRPs
CREATE TABLE IF NOT EXISTS parsed_prps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    youtube_url TEXT NOT NULL,
    video_id TEXT NOT NULL,
    video_title TEXT NOT NULL,
    video_description TEXT,
    channel_title TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    duration TEXT,
    transcript TEXT,
    parsed_content JSONB NOT NULL,
    created_by TEXT NOT NULL, -- GitHub username
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notion_page_id TEXT,
    notion_sync_status TEXT DEFAULT 'not_synced' CHECK (notion_sync_status IN ('not_synced', 'syncing', 'synced', 'failed')),
    notion_sync_error TEXT,
    notion_synced_at TIMESTAMP WITH TIME ZONE
);

-- Create prp_tasks table to store individual tasks extracted from PRPs
CREATE TABLE IF NOT EXISTS prp_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prp_id UUID NOT NULL REFERENCES parsed_prps(id) ON DELETE CASCADE,
    order_num INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('create', 'modify', 'test', 'deploy', 'other')),
    file_path TEXT,
    pseudocode TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by TEXT -- GitHub username if completed
);

-- Create indexes for common queries
CREATE INDEX idx_parsed_prps_created_by ON parsed_prps(created_by);
CREATE INDEX idx_parsed_prps_created_at ON parsed_prps(created_at DESC);
CREATE INDEX idx_parsed_prps_youtube_url ON parsed_prps(youtube_url);
CREATE INDEX idx_parsed_prps_video_id ON parsed_prps(video_id);
CREATE INDEX idx_parsed_prps_notion_sync_status ON parsed_prps(notion_sync_status);
CREATE INDEX idx_prp_tasks_prp_id ON prp_tasks(prp_id);
CREATE INDEX idx_prp_tasks_status ON prp_tasks(status);
CREATE INDEX idx_prp_tasks_type ON prp_tasks(type);

-- Create a view for PRP summaries with task counts
CREATE VIEW prp_summaries AS
SELECT 
    p.id,
    p.youtube_url,
    p.video_title,
    p.channel_title,
    p.created_by,
    p.created_at,
    p.notion_sync_status,
    p.notion_page_id,
    p.parsed_content->>'name' as prp_name,
    p.parsed_content->>'description' as prp_description,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_tasks,
    COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_tasks
FROM parsed_prps p
LEFT JOIN prp_tasks t ON p.id = t.prp_id
GROUP BY p.id;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_parsed_prps_updated_at BEFORE UPDATE ON parsed_prps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prp_tasks_updated_at BEFORE UPDATE ON prp_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust based on your database users)
-- GRANT SELECT, INSERT, UPDATE ON parsed_prps TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON prp_tasks TO your_app_user;
-- GRANT SELECT ON prp_summaries TO your_app_user;