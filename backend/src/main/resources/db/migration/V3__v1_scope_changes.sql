-- V3: V1 Scope Simplifications (first_login and readme_content)
ALTER TABLE students ADD COLUMN IF NOT EXISTS first_login BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS readme_content TEXT;
