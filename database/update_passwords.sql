-- ============================================
-- Update User Passwords
-- Run this AFTER importing student_portal.sql
-- ============================================

USE student_portal;

-- Update all users with password: password123
-- Hash generated with bcrypt for 'password123'
UPDATE users 
SET password_hash = '$2a$10$3DY3JAwztGS.4uxrq1vDNuZIiSeJQ139xvXN6qyUWdUjRNNreaGCu'
WHERE user_id IN (1, 2, 3, 4, 5, 6, 7, 8);

SELECT 'Passwords updated successfully! All users can now login with password: password123' as message;

-- Verify update
SELECT user_id, email, full_name, 'password123' as password FROM users WHERE user_id <= 8;


