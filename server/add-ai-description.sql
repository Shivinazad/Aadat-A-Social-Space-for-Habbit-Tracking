-- Add aiDescription column to Habits table
ALTER TABLE Habits ADD COLUMN aiDescription TEXT NULL AFTER description;
