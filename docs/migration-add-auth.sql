-- Migration: Add authentication fields to users table
-- Date: 2024-12-17

-- Add password and authentication related fields
ALTER TABLE users 
ADD COLUMN password varchar NOT NULL DEFAULT '';

ALTER TABLE users 
ADD COLUMN is_email_verified boolean DEFAULT false;

ALTER TABLE users 
ADD COLUMN reset_password_token varchar;

ALTER TABLE users 
ADD COLUMN reset_password_expires timestamp;

-- Make email required
ALTER TABLE users 
ALTER COLUMN email SET NOT NULL;

-- Drop sessions table if exists (no longer needed with JWT)
DROP TABLE IF EXISTS sessions;