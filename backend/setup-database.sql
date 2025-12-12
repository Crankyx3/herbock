-- Herbock Database Schema Setup

-- Drop existing tables if they exist
DROP TABLE IF EXISTS "measurements" CASCADE;
DROP TABLE IF EXISTS "chat_messages" CASCADE;
DROP TABLE IF EXISTS "vacation_requests" CASCADE;
DROP TABLE IF EXISTS "time_entries" CASCADE;
DROP TABLE IF EXISTS "defects" CASCADE;
DROP TABLE IF EXISTS "rooms" CASCADE;
DROP TABLE IF EXISTS "projects" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS "Language" CASCADE;
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "ProjectStatus" CASCADE;
DROP TYPE IF EXISTS "DefectStatus" CASCADE;
DROP TYPE IF EXISTS "DefectPriority" CASCADE;
DROP TYPE IF EXISTS "VacationStatus" CASCADE;

-- Create Enums
CREATE TYPE "Language" AS ENUM ('DE', 'PL', 'RU', 'EN');
CREATE TYPE "UserRole" AS ENUM ('EMPLOYEE', 'ADMIN', 'MANAGER');
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "DefectStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED');
CREATE TYPE "DefectPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "VacationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- Users Table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'DE',
    "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "profileImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Projects Table
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "floorPlanUrl" TEXT,
    "unreadMessages" INTEGER NOT NULL DEFAULT 0,
    "openDefects" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- Rooms Table
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "floor" TEXT,
    "area" DOUBLE PRECISION,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- Defects Table
CREATE TABLE "defects" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "roomId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "originalDescription" TEXT,
    "originalLanguage" "Language",
    "status" "DefectStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "DefectPriority" NOT NULL DEFAULT 'MEDIUM',
    "assignedToId" TEXT,
    "createdById" TEXT NOT NULL,
    "locationX" DOUBLE PRECISION,
    "locationY" DOUBLE PRECISION,
    "locationFloor" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "defects_pkey" PRIMARY KEY ("id")
);

-- Time Entries Table
CREATE TABLE "time_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "isRunning" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- Vacation Requests Table
CREATE TABLE "vacation_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "VacationStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vacation_requests_pkey" PRIMARY KEY ("id")
);

-- Chat Messages Table
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- Measurements Table
CREATE TABLE "measurements" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "values" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "defects" ADD CONSTRAINT "defects_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "defects" ADD CONSTRAINT "defects_roomId_fkey"
    FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "defects" ADD CONSTRAINT "defects_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "defects" ADD CONSTRAINT "defects_assignedToId_fkey"
    FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "vacation_requests" ADD CONSTRAINT "vacation_requests_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "measurements" ADD CONSTRAINT "measurements_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "measurements" ADD CONSTRAINT "measurements_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert Test Admin User (password: admin123)
INSERT INTO "users" ("id", "email", "password", "firstName", "lastName", "language", "role", "createdAt", "updatedAt")
VALUES (
    'admin-user-id-001',
    'admin@herbock.de',
    '$2b$10$YQ8P.5J5Q5Q5Q5Q5Q5Q5QuO0Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Zem', -- admin123
    'Admin',
    'Herbock',
    'DE',
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert Test Employee User (password: test123)
INSERT INTO "users" ("id", "email", "password", "firstName", "lastName", "language", "role", "createdAt", "updatedAt")
VALUES (
    'employee-user-id-001',
    'test@herbock.de',
    '$2b$10$YQ8P.5J5Q5Q5Q5Q5Q5Q5QuO0Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Zem', -- test123
    'Max',
    'Mustermann',
    'DE',
    'EMPLOYEE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert Test Project
INSERT INTO "projects" ("id", "name", "description", "status", "startDate", "floorPlanUrl", "openDefects", "unreadMessages", "createdAt", "updatedAt")
VALUES (
    'project-001',
    'Bauvorhaben Müller',
    'Neubau Einfamilienhaus mit Garage',
    'ACTIVE',
    '2024-01-15',
    '/uploads/grundrissplan.pdf',
    5,
    2,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert Test Rooms
INSERT INTO "rooms" ("id", "projectId", "name", "floor", "area", "description", "createdAt", "updatedAt")
VALUES
    ('room-001', 'project-001', 'Eingangsbereich', 'EG', 25.0, 'Haupteingang mit Empfangsbereich', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('room-002', 'project-001', 'Wohnzimmer', 'EG', 45.5, 'Großes Wohnzimmer mit Südausrichtung', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('room-003', 'project-001', 'Küche', 'EG', 20.0, 'Moderne Einbauküche', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('room-004', 'project-001', 'Badezimmer OG', '1. OG', 12.5, 'Hauptbadezimmer mit Dusche und Badewanne', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('room-005', 'project-001', 'Schlafzimmer 1', '1. OG', 18.0, 'Elternschlafzimmer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Test Defects
INSERT INTO "defects" ("id", "projectId", "roomId", "title", "description", "status", "priority", "createdById", "locationX", "locationY", "locationFloor", "images", "createdAt", "updatedAt")
VALUES
    ('defect-001', 'project-001', 'room-001', 'Riss in der Wand', 'Vertikaler Riss an der Nordwand, ca. 30cm lang', 'OPEN', 'HIGH', 'employee-user-id-001', 0.25, 0.35, 'EG', ARRAY[]::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('defect-002', 'project-001', 'room-002', 'Fehlende Steckdose', 'Steckdose fehlt an der Ostwand', 'OPEN', 'MEDIUM', 'employee-user-id-001', 0.78, 0.45, 'EG', ARRAY[]::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('defect-003', 'project-001', 'room-003', 'Kratzer auf Arbeitsplatte', 'Tiefe Kratzer auf der Granitplatte', 'IN_PROGRESS', 'LOW', 'employee-user-id-001', 0.50, 0.60, 'EG', ARRAY[]::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

COMMIT;
