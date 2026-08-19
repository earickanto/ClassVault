# ClassVault Production Data Management & Safety Guide

This operational safety guide documents the architecture, database schema, CSV ingestion workflows, authentication, data isolation, and safety procedures for ClassVault in production.

---

## 1. Database Architecture & Safety Overview

ClassVault is backed by a PostgreSQL database (hosted on Supabase) managed via Flyway schema migrations.

### Table Schema & Constraints

| Table Name | Primary Key | Key Foreign Keys / Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `students` | `id BIGSERIAL` | `UNIQUE(roll_number)`, `UNIQUE(register_number)`, `UNIQUE(email)` | Core academic identity, profile metadata, login state. |
| `admins` | `id BIGSERIAL` | `UNIQUE(username)`, `UNIQUE(email)` | System administrators & moderators. |
| `projects` | `id BIGSERIAL` | `FOREIGN KEY(owner_student_id) REFERENCES students(id) ON DELETE CASCADE` | Student repository projects. |
| `project_files` | `id BIGSERIAL` | `FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE` | Source code files & file trees. |
| `project_bookmarks` | `id BIGSERIAL` | `FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE`, `FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE` | Student bookmark associations. |
| `project_likes` | `id BIGSERIAL` | `FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE`, `FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE` | Unique like records per student. |
| `announcements` | `id BIGSERIAL` | `FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE SET NULL` | Broadcast notifications. |
| `badges` | `id BIGSERIAL` | `UNIQUE(name)` | Gamification & milestone badges. |
| `student_badges` | `id BIGSERIAL` | `FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE`, `FOREIGN KEY(badge_id) REFERENCES badges(id) ON DELETE CASCADE` | Earned achievements. |

### Migration History
1. `V1__init_schema.sql`: Initializes tables with `UNIQUE` constraints for `roll_number` and `register_number`.
2. `V2__initial_seed_data.sql`: Seed data for pilot testing.
3. `V3__production_seed_and_demo.sql`: Production verification seed accounts.
4. `V4__student_datasource_and_safety.sql`: Non-destructive column addition `data_source VARCHAR(20) DEFAULT 'IMPORTED'`, tags `DEMO` vs `IMPORTED`, adds composite index on `(department, "year", section)`.

---

## 2. Standard CSV Schema Specification

For full-class onboarding, the CSV file must contain **exactly 6 columns** with the following header:

```csv
name,register_number,roll_number,department,year,section
```

### Column Constraints
- **`name`**: Full student name (Non-empty text).
- **`register_number`**: Official University Register Number (Unique across the institution, e.g., `REG2026001`).
- **`roll_number`**: College Class Roll Number (Unique across the institution, e.g., `26A001`).
- **`department`**: Department Name (e.g., `Artificial Intelligence & Data Science`, `Computer Science & Engineering`).
- **`year`**: Academic Year as integer `1`, `2`, `3`, or `4`.
- **`section`**: Section label (e.g., `A`, `B`, `C`).

---

## 3. Two-Step CSV Preview & Confirmation Workflow

To prevent accidental data corruption or malformed batch insertion, ClassVault enforces a **2-step preview & confirmation workflow**:

1. **Step 1 — Preview & Live Validation (`POST /api/v1/admin/students/csv/preview`)**:
   - The CSV is parsed in memory.
   - Each row is checked for:
     - Null or blank required fields.
     - Year range validity (1–4).
     - Intra-batch duplicates on `register_number` and `roll_number`.
     - Existing database collisions on `register_number` and `roll_number`.
   - The UI presents a live breakdown: Total Rows, Valid Rows, Duplicate Conflicts, and Invalid Rows with exact row-by-row error diagnostics.
2. **Step 2 — Confirmation & Batch Commit (`POST /api/v1/admin/students/csv/confirm`)**:
   - The admin is prompted with: *"Ready to import <N> valid students?"*.
   - Upon confirmation, records are inserted in a database transaction.
   - Default initial password `ClassVault@123` is BCrypt hashed.
   - `firstLogin` is initialized to `true`, and `dataSource` is set to `IMPORTED`.

---

## 4. Student First-Login & Password Lifecycle

1. **Initial Provisioning**: Admin imports student record -> account created with default temporary password `ClassVault@123` and `firstLogin = true`.
2. **First Sign In**: Student logs in with their `registerNumber` (or `rollNumber`) and `ClassVault@123`.
3. **Mandatory Password Change**: The system detects `firstLogin = true` and displays the mandatory password reset modal. The user cannot navigate elsewhere until a new password (min 6 characters) distinct from `ClassVault@123` is set.
4. **Subsequent Sign In**: `firstLogin` becomes `false`. Student logs in with their chosen password.

---

## 5. Password Reset Procedures

- **Self-Service**: Students can change their password anytime via `/profile` by entering their current password and new password.
- **Admin Password Reset**: An administrator can reset any student's password directly from the Admin Student Directory. Resetting an account automatically sets `firstLogin = true`, forcing the student to choose a new password upon their next login.

---

## 6. How to Backup Production Data

Before performing any large import, export a database backup:

### Option A: Supabase Dashboard
1. Log into your Supabase Dashboard.
2. Navigate to **Database** -> **Backups**.
3. Trigger a manual snapshot or download the latest automated daily backup.

### Option B: `pg_dump` CLI
```powershell
pg_dump -h <SUPABASE_HOST> -p 5432 -U postgres -d postgres -F c -b -v -f "classvault_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').dump"
```

---

## 7. How to Safely Add New Students

- **Single Student**: Admin Portal -> Students -> Click **"Add Student"** -> Fill in name, roll number, register number, department, year, section -> Submit.
- **Batch Class Addition**: Admin Portal -> Students -> Click **"Bulk CSV Import"** -> Upload CSV -> Inspect Preview Table -> Click **"Import Valid Students"**.

---

## 8. How to Disable a Student Account

To temporarily suspend a student's access without deleting their project portfolio or class records:
1. Navigate to **Admin Command Center** -> **Students**.
2. Locate the student in the directory.
3. Toggle the **Active / Disabled** pill button in the Status column.
4. Disabled accounts are immediately blocked at the JWT filter level (`401/403 Account Disabled`).

---

## 9. Critical Safety Rules: What NOT to Delete Manually

> [!CAUTION]
> - **NEVER** execute `DROP TABLE`, `TRUNCATE`, or `DELETE FROM students` on production Supabase.
> - **NEVER** edit or delete records directly in the `flyway_schema_history` table.
> - **NEVER** commit real student credentials, phone numbers, or passwords into Git repositories.
