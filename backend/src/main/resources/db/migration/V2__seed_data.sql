-- Seed Admin User (Password: Admin@123)
INSERT INTO admins (id, name, email, password_hash, created_at)
VALUES (1, 'System Admin', 'admin@classvault.edu', '$2a$10$t/TFwk7mjvssNNo3loi9h.DWaCN24XDqK92KQboNKGgScDnGQRely', CURRENT_TIMESTAMP);

-- Seed Badges
INSERT INTO badges (id, name, icon, description) VALUES
(1, 'Top Contributor', 'Award', 'Awarded for uploading 5+ approved projects'),
(2, 'Code Wizard', 'Code', 'Awarded for exceptional code quality and architecture'),
(3, 'Popular Project', 'Flame', 'Awarded for receiving 50+ likes on a single project'),
(4, 'Class Leader', 'Trophy', 'Ranked #1 on the ClassVault leaderboard');

-- Seed Demo Students (Password for 1-3: Student@123, Password for 4: ClassVault@123 with first_login = true)
INSERT INTO students (id, name, roll_number, register_number, department, "year", section, email, password_hash, profile_photo_url, bio, github_url, leetcode_url, linkedin_url, portfolio_url, skills, account_enabled, first_login, joined_at)
VALUES 
(1, 'John Doe', '21CS001', 'REG2021001', 'Computer Science & Engineering', 4, 'A', 'john.doe@classvault.edu', '$2a$10$3eNaOdqLoAOWFjNhJ8RAoug6SOzxPTbtluyzXElxDHZWXWqk.B9Fi', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'Passionate full-stack developer focusing on React, Spring Boot, and cloud architecture.', 'https://github.com/johndoe', 'https://leetcode.com/johndoe', 'https://linkedin.com/in/johndoe', 'https://johndoe.dev', 'React,Spring Boot,Java,TypeScript,Docker,MySQL', TRUE, FALSE, CURRENT_TIMESTAMP),
(2, 'Jane Smith', '21CS002', 'REG2021002', 'Computer Science & Engineering', 4, 'A', 'jane.smith@classvault.edu', '$2a$10$3eNaOdqLoAOWFjNhJ8RAoug6SOzxPTbtluyzXElxDHZWXWqk.B9Fi', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', 'AI & Data Science enthusiast. Building intelligent web apps and neural network systems.', 'https://github.com/janesmith', 'https://leetcode.com/janesmith', 'https://linkedin.com/in/janesmith', 'https://janesmith.ai', 'Python,PyTorch,FastAPI,Machine Learning,React', TRUE, FALSE, CURRENT_TIMESTAMP),
(3, 'Alex Chen', '21CS003', 'REG2021003', 'Information Technology', 3, 'B', 'alex.chen@classvault.edu', '$2a$10$3eNaOdqLoAOWFjNhJ8RAoug6SOzxPTbtluyzXElxDHZWXWqk.B9Fi', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'Mobile app developer & UI/UX perfectionist. Flutter & Swift developer.', 'https://github.com/alexchen', 'https://leetcode.com/alexchen', 'https://linkedin.com/in/alexchen', 'https://alexchen.design', 'Flutter,Dart,Firebase,iOS,Figma', TRUE, FALSE, CURRENT_TIMESTAMP),
(4, 'Sarah Kim', '21CS004', 'REG2021004', 'Computer Science & Engineering', 3, 'B', 'sarah.kim@classvault.edu', '$2a$10$Fw.lC3zLgPz2zXz1bXwUe.6Z8o8W8X2qX2Z2q2X2Z2q2X2Z2q2X2a', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 'Backend engineering nerd. Distributed systems, Go microservices, and PostgreSQL.', 'https://github.com/sarahkim', 'https://leetcode.com/sarahkim', 'https://linkedin.com/in/sarahkim', 'https://sarahkim.io', 'Go,PostgreSQL,Kubernetes,gRPC,Redis', TRUE, TRUE, CURRENT_TIMESTAMP);

-- Award Sample Badges
INSERT INTO student_badges (id, student_id, badge_id, awarded_at) VALUES
(1, 1, 1, CURRENT_TIMESTAMP),
(2, 1, 4, CURRENT_TIMESTAMP),
(3, 2, 2, CURRENT_TIMESTAMP);

-- Seed Demo Projects with README Documentation
INSERT INTO projects (id, owner_student_id, title, description, readme_content, technology_used, category, semester, github_repo_url, live_demo_url, visibility, status, featured, views_count, downloads_count, likes_count, created_at, updated_at) VALUES
(1, 1, 'ClassVault Project Management SaaS', 'A private, invite-only project repository web application built with Spring Boot 3, React 18, and MySQL.', '# ClassVault Project Management SaaS

## Overview
ClassVault is an academic project vault created exclusively for our class.

## Key Features
- **Registration Number Authentication**: Fast and private access.
- **Strict Privacy Controls**: Private vs Public repository visibility.
- **Leaderboard & Analytics**: Real-time ranking based on project activity.

## Technologies Used
- Spring Boot 3.3.5 & Java 21
- React 18 & Vite
- PostgreSQL / H2 Database

## Setup Instructions
```bash
git clone https://github.com/johndoe/classvault.git
cd backend && ./mvnw spring-boot:run
cd ../frontend && npm install && npm run dev
```

## Future Scope
- Peer code review workflows and automated static analysis integration.', 'React,Spring Boot,Java 21,Tailwind CSS,MySQL', 'Web Application', 6, 'https://github.com/johndoe/classvault', 'https://classvault.demo.com', 'PUBLIC', 'APPROVED', TRUE, 142, 38, 24, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(2, 2, 'NeuroVision - Medical Image Classifier', 'Deep learning pipeline leveraging ResNet-50 and PyTorch for automated MRI tumor detection.', '# NeuroVision — Medical Image Classifier

## Overview
Deep learning classification model trained on 15,000 anonymized MRI scans for preliminary anomaly detection.

## Architecture
- ResNet-50 backbone fine-tuned on PyTorch
- FastAPI backend serving ONNX runtime models
- React frontend with interactive DICOM viewer', 'Python,PyTorch,FastAPI,React,Docker', 'Machine Learning', 7, 'https://github.com/janesmith/neurovision', 'https://neurovision-demo.com', 'PUBLIC', 'APPROVED', TRUE, 98, 22, 19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(3, 3, 'CampusConnect Mobile App', 'Flutter cross-platform application for student course scheduling, announcements, and peer messaging.', '# CampusConnect Mobile App

## Overview
Mobile application for university campus life, club events, and peer communication built with Flutter and Firebase.', 'Flutter,Dart,Firebase,Node.js', 'Mobile App', 6, 'https://github.com/alexchen/campusconnect', 'https://campusconnect.app', 'PUBLIC', 'APPROVED', FALSE, 76, 14, 11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(4, 4, 'DistriStore - High Throughput KV Cache', 'Distributed in-memory key-value store in Go implementing Raft consensus algorithm.', '# DistriStore — High Throughput KV Cache

## Overview
A distributed in-memory key-value store written in Go that achieves strong consistency via the Raft consensus algorithm.', 'Go,Raft,gRPC,Protobuf,Docker', 'Systems & Cloud', 7, 'https://github.com/sarahkim/distristore', 'https://distristore.io', 'PUBLIC', 'APPROVED', FALSE, 65, 18, 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(5, 1, 'SmartLab IoT Sensor Platform', 'Real-time laboratory environmental monitoring dashboard with ESP32 sensors and WebSockets.', '# SmartLab IoT Sensor Platform

## Overview
Real-time temperature, humidity, and air quality telemetry for chemistry research labs.', 'React,Java,MQTT,Spring Boot,Chart.js', 'IoT & Embedded', 5, 'https://github.com/johndoe/smartlab', 'https://smartlab.io', 'PUBLIC', 'APPROVED', FALSE, 44, 9, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed Comments
INSERT INTO comments (id, project_id, student_id, content, created_at) VALUES
(1, 1, 2, 'Super clean UI and impressive Spring Security setup! Love the SaaS aesthetic.', CURRENT_TIMESTAMP),
(2, 1, 3, 'The QR Code Digital Student ID feature is awesome. Great work John!', CURRENT_TIMESTAMP),
(3, 2, 1, 'Impressive accuracy stats on the ResNet model. Did you train it on AWS?', CURRENT_TIMESTAMP);

-- Seed Likes
INSERT INTO likes (id, project_id, student_id, created_at) VALUES
(1, 1, 2, CURRENT_TIMESTAMP),
(2, 1, 3, CURRENT_TIMESTAMP),
(3, 1, 4, CURRENT_TIMESTAMP),
(4, 2, 1, CURRENT_TIMESTAMP),
(5, 2, 3, CURRENT_TIMESTAMP);

-- Seed Announcements
INSERT INTO announcements (id, admin_id, title, body, created_at) VALUES
(1, 1, 'Final Semester Project Submissions Open', 'Welcome students! ClassVault is now live. Please submit your semester projects before November 30th for evaluation.', CURRENT_TIMESTAMP),
(2, 1, 'Class Project Showcase & Awards', 'The top 3 ranked projects on the ClassVault Leaderboard will be presented at the Annual CS Tech Symposium.', CURRENT_TIMESTAMP);

-- Seed Notifications
INSERT INTO notifications (id, student_id, type, message, is_read, created_at) VALUES
(1, 1, 'PROJECT_LIKE', 'Jane Smith liked your project "ClassVault Project Management SaaS"', FALSE, CURRENT_TIMESTAMP),
(2, 1, 'PROJECT_COMMENT', 'Jane Smith commented on your project "ClassVault Project Management SaaS"', FALSE, CURRENT_TIMESTAMP),
(3, 1, 'ANNOUNCEMENT', 'Admin posted: Final Semester Project Submissions Open', FALSE, CURRENT_TIMESTAMP);

-- Seed Leaderboard Snapshots
INSERT INTO leaderboard_snapshot (id, student_id, rank_position, score, generated_at) VALUES
(1, 1, 1, 350, CURRENT_TIMESTAMP),
(2, 2, 2, 220, CURRENT_TIMESTAMP),
(3, 4, 3, 180, CURRENT_TIMESTAMP),
(4, 3, 4, 140, CURRENT_TIMESTAMP);

-- Advance Identity Sequences to prevent duplicate key conflicts on new inserts
ALTER TABLE admins ALTER COLUMN id RESTART WITH 10;
ALTER TABLE students ALTER COLUMN id RESTART WITH 10;
ALTER TABLE badges ALTER COLUMN id RESTART WITH 10;
ALTER TABLE student_badges ALTER COLUMN id RESTART WITH 10;
ALTER TABLE projects ALTER COLUMN id RESTART WITH 10;
ALTER TABLE comments ALTER COLUMN id RESTART WITH 10;
ALTER TABLE likes ALTER COLUMN id RESTART WITH 10;
ALTER TABLE announcements ALTER COLUMN id RESTART WITH 10;
ALTER TABLE notifications ALTER COLUMN id RESTART WITH 10;
ALTER TABLE leaderboard_snapshot ALTER COLUMN id RESTART WITH 10;
