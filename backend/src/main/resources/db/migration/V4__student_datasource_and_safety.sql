-- V4: Real class data safety, data source tracking, and indexing
ALTER TABLE students ADD COLUMN IF NOT EXISTS data_source VARCHAR(20) NOT NULL DEFAULT 'IMPORTED';

-- Mark initial pilot/seed accounts as DEMO
UPDATE students 
SET data_source = 'DEMO' 
WHERE email LIKE '%@classvault.local' 
  AND roll_number IN ('21CS001', '21CS002', '21CS003', '21CS004');

-- Composite index for high-performance class filtering by department, year, section
CREATE INDEX IF NOT EXISTS idx_students_dept_year_sec ON students(department, "year", section);
