-- ============================================================
-- Smart Employee Service Desk - Database Schema (MySQL)
-- ============================================================
-- Run this against a fresh MySQL database, e.g.:
--   CREATE DATABASE ServiceDeskDB;
--   USE ServiceDeskDB;
-- then execute this whole file.
-- ============================================================

-- --------------------------------------------
-- Table: Users
-- Represents both employees and support staff.
-- We don't have a "Role" column because roles are
-- simulated on the frontend via a dropdown (see README).
-- --------------------------------------------
CREATE TABLE Users (
    UserId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(150) NOT NULL,
    Department VARCHAR(100) NULL
) ENGINE=InnoDB;

-- --------------------------------------------
-- Table: Categories
-- The "department" a ticket belongs to (IT, HR, etc.)
-- --------------------------------------------
CREATE TABLE Categories (
    CategoryId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- --------------------------------------------
-- Table: Tickets
-- The core entity. Each ticket belongs to one category,
-- is created by one user, and can optionally be assigned
-- to another user (support staff).
--
-- Priority/Status use ENUM, which is MySQL's native way to
-- restrict a column to a fixed list of values - this is the
-- MySQL equivalent of the CHECK constraint approach used in
-- SQL Server, and works on every MySQL version.
-- --------------------------------------------
CREATE TABLE Tickets (
    TicketId INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Description TEXT NOT NULL,
    CategoryId INT NOT NULL,
    Priority ENUM('High', 'Medium', 'Low') NOT NULL,
    Status ENUM('Open', 'Assigned', 'In Progress', 'Resolved', 'Closed') NOT NULL,
    CreatedBy INT NOT NULL,
    AssignedTo INT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ClosedDate DATETIME NULL,

    CONSTRAINT FK_Tickets_Category FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId),
    CONSTRAINT FK_Tickets_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(UserId),
    CONSTRAINT FK_Tickets_AssignedTo FOREIGN KEY (AssignedTo) REFERENCES Users(UserId)
) ENGINE=InnoDB;

-- --------------------------------------------
-- Table: Comments
-- A running log of notes/updates on a ticket, added
-- by either the employee or support staff.
-- --------------------------------------------
CREATE TABLE Comments (
    CommentId INT AUTO_INCREMENT PRIMARY KEY,
    TicketId INT NOT NULL,
    UserId INT NOT NULL,
    Notes TEXT NOT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_Comments_Ticket FOREIGN KEY (TicketId) REFERENCES Tickets(TicketId),
    CONSTRAINT FK_Comments_User FOREIGN KEY (UserId) REFERENCES Users(UserId)
) ENGINE=InnoDB;

-- --------------------------------------------
-- Helpful indexes for the filters the API supports
-- (GET /api/tickets?status=&priority=&categoryId=)
-- --------------------------------------------
CREATE INDEX IX_Tickets_Status ON Tickets(Status);
CREATE INDEX IX_Tickets_Priority ON Tickets(Priority);
CREATE INDEX IX_Tickets_CategoryId ON Tickets(CategoryId);
