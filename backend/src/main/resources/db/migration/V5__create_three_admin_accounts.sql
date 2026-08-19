-- V5: Create 3 administrator accounts (admin1, admin2, admin3)
-- Passwords are encrypted with BCrypt (cost factor 10)
-- Idempotent: Uses WHERE NOT EXISTS to prevent duplicates across PostgreSQL and H2

INSERT INTO admins (name, email, password_hash, created_at)
SELECT 'Admin One', 'admin1@classvault.edu', '$2a$10$PXu0FGsIXojeJhp6L66dQ.PnNyqXow8zIeDWCzmBHYqnBd0OEvnwK', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE email = 'admin1@classvault.edu');

INSERT INTO admins (name, email, password_hash, created_at)
SELECT 'Admin Two', 'admin2@classvault.edu', '$2a$10$QYO1Gr2oHk9PbSlvlC9Lh.67z43UoZUokvsHaZqStz.ZHb3641FpS', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE email = 'admin2@classvault.edu');

INSERT INTO admins (name, email, password_hash, created_at)
SELECT 'Admin Three', 'admin3@classvault.edu', '$2a$10$472DGABBBXeK9R0fdJaO4u1iF3tEWsR051azr53m.ANAi7mmSI8Z6', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE email = 'admin3@classvault.edu');
