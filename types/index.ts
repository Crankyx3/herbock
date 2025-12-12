// User & Authentication
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  language: Language;
  role: UserRole;
  profileImage?: string;
}

export type Language = 'de' | 'pl' | 'ru' | 'en';

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
}

// Modul 1: Mitarbeiter-App
export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  activity: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  isRunning: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate: Date;
  endDate?: Date;
  unreadMessages: number;
  openDefects: number;
  floorPlanUrl?: string;
  rooms?: Room[];
}

export interface Room {
  id: string;
  projectId: string;
  name: string;
  floor?: string;
  area?: number;
  description?: string;
  floorPlanUrl?: string;
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export interface VacationRequest {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  status: VacationStatus;
  reason?: string;
}

export enum VacationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface PaySlip {
  id: string;
  userId: string;
  month: number;
  year: number;
  pdfUrl: string;
  isRead: boolean;
}

// Modul 2: Projekt-App
export interface ChatMessage {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  mediaUrl?: string;
  createdAt: Date;
  user: User;
}

export interface Defect {
  id: string;
  projectId: string;
  roomId?: string;
  title: string;
  description: string;
  originalDescription?: string;
  originalLanguage?: Language;
  status: DefectStatus;
  priority: DefectPriority;
  assignedTo?: string;
  createdBy: string;
  location?: DefectLocation;
  images: string[];
  audioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DefectLocation {
  x: number;
  y: number;
  floor?: string;
}

export enum DefectPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum DefectStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  VERIFIED = 'VERIFIED',
}

export interface Measurement {
  id: string;
  projectId: string;
  room: string;
  values: Record<string, number | string>;
  createdBy: string;
  createdAt: Date;
}

// Notifications
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export enum NotificationType {
  TIME_ENTRY_INCOMPLETE = 'TIME_ENTRY_INCOMPLETE',
  NEW_MESSAGE = 'NEW_MESSAGE',
  DEFECT_ASSIGNED = 'DEFECT_ASSIGNED',
  VACATION_APPROVED = 'VACATION_APPROVED',
  VACATION_REJECTED = 'VACATION_REJECTED',
}

// Dashboard Stats
export interface WeeklyStats {
  currentHours: number;
  targetHours: number;
  weekNumber: number;
}
