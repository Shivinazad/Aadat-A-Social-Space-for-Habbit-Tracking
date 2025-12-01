-- Fix Habits table schema for AI roadmap feature
-- Add missing columns for description, aiDescription, and roadmap

ALTER TABLE Habits ADD COLUMN IF NOT EXISTS description TEXT NULL;
ALTER TABLE Habits ADD COLUMN IF NOT EXISTS aiDescription TEXT NULL;
ALTER TABLE Habits ADD COLUMN IF NOT EXISTS roadmap JSON NULL;
