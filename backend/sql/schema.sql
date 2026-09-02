-- =============================================================
-- Smart Employee Service Desk & Ticket Management Portal
-- MySQL 8.0 schema
-- =============================================================
-- This script is idempotent-ish: it creates the database and
-- tables only if they do not already exist. Run it once to set
-- up the schema, or use `npm run db:init` which executes it.
-- =============================================================

CREATE DATABASE IF NOT EXISTS service_desk
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE service_desk;

-- ---------- Categories (departments) ----------
CREATE TABLE IF NOT EXISTS categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  CONSTRAINT uq_categories_name UNIQUE (name)
) ENGINE=InnoDB;

-- ---------- Users (employees & support staff) ----------
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name    VARCHAR(120) NOT NULL,
  email   VARCHAR(160) NOT NULL,
  role    ENUM('Employee', 'Support', 'Admin') NOT NULL DEFAULT 'Employee',
  CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB;

-- Widens the role enum on databases created before the Admin role existed.
ALTER TABLE users MODIFY COLUMN role ENUM('Employee', 'Support', 'Admin') NOT NULL DEFAULT 'Employee';

-- NOTE: the `department_id` column (Admin/Support's department, NULL for
-- Employees) is added programmatically in src/db/initialize.js, since MySQL
-- does not support "ADD COLUMN IF NOT EXISTS" the way this script's other
-- idempotent statements are written.

-- ---------- Tickets ----------
-- Indexes are declared inline so this script stays idempotent.
CREATE TABLE IF NOT EXISTS tickets (
  ticket_id    INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(200) NOT NULL,
  description  TEXT NOT NULL,
  category_id  INT NOT NULL,
  priority     ENUM('High', 'Medium', 'Low') NOT NULL DEFAULT 'Medium',
  status       ENUM('Open', 'In Progress', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open',
  created_by   INT NOT NULL,
  assigned_to  INT NULL,
  created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tickets_status   (status),
  INDEX idx_tickets_priority (priority),
  INDEX idx_tickets_category (category_id),
  INDEX idx_tickets_assigned (assigned_to),
  INDEX idx_tickets_created  (created_date),
  CONSTRAINT fk_tickets_category FOREIGN KEY (category_id) REFERENCES categories(category_id),
  CONSTRAINT fk_tickets_creator  FOREIGN KEY (created_by)  REFERENCES users(user_id),
  CONSTRAINT fk_tickets_assignee FOREIGN KEY (assigned_to) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- ---------- Comments / resolution notes ----------
CREATE TABLE IF NOT EXISTS comments (
  comment_id   INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id    INT NOT NULL,
  author_id    INT NULL,
  notes        TEXT NOT NULL,
  created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_comments_ticket (ticket_id),
  CONSTRAINT fk_comments_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users(user_id)
) ENGINE=InnoDB;
