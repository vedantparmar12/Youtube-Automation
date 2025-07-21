-- Migration 002: Update task types to support more categories
-- This migration updates the task type constraint to include additional types

-- First, drop the existing constraint
ALTER TABLE prp_tasks DROP CONSTRAINT IF EXISTS prp_tasks_type_check;

-- Add the new constraint with expanded task types
ALTER TABLE prp_tasks ADD CONSTRAINT prp_tasks_type_check 
  CHECK (type IN ('create', 'modify', 'test', 'deploy', 'analyze', 'design', 'document', 'research', 'review', 'other'));

-- Update any existing 'other' tasks that might better fit the new categories (optional)
-- This is commented out by default - uncomment if you want to reclassify existing tasks
-- UPDATE prp_tasks 
-- SET type = 'analyze' 
-- WHERE type = 'other' AND (title ILIKE '%analyze%' OR title ILIKE '%analysis%');