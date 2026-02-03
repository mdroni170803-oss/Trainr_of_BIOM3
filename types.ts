
export type Theme = 'light' | 'dark';

export type NavTab = 'Admin' | 'Sedulous' | 'Courses';

export interface Admin {
  id: string;
  name: string;
  age: number;
  gender: string;
  address: string;
  mobile: string;
  whatsapp?: string;
  batch: string;
  joinDate: string;
  currentTrainer: string;
  latestTrainer: string;
  facebookLink: string;
  documents: string[]; // base64 strings
  rating: number; // 1-5
  isActive: boolean;
}

export interface SedulousEntry {
  id: string;
  courseName: string;
  classType: string;
  batchNumber: string;
  classTime: string; // e.g. "10:30 AM"
  classDays: string[]; // e.g. ["Monday", "Wednesday"]
  lastNotifiedAt?: string; // ISO string to prevent duplicate notifications for same event
}

export interface Batch {
  id: string;
  batchNumber: string;
  startDate: string;
  admissionDate: string;
  headTeacher: string;
  adminIds: string[];
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  batches: Batch[];
}

export interface AppData {
  admins: Admin[];
  sedulous: SedulousEntry[];
  courses: Course[];
  version: string;
  lastUpdated: string;
}

export const APP_VERSION = "1.0.0";
