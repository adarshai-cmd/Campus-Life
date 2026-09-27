export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export interface TimetableSlot {
  id: string;
  day: DayOfWeek;
  subject: string;
  teacher: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:00"
  classroom: string;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  subjectName: string;
  totalClasses: number;
  attendedClasses: number;
  targetPercentage: number; // e.g. 75
}

export type AttendanceDailyStatus = 'present' | 'absent';

export interface AttendanceDailyLog {
  id: string;
  subjectId: string;
  date: string; // YYYY-MM-DD local date
  status: AttendanceDailyStatus;
  timestamp: string; // ISO string
}

export interface AttendanceStats {
  percentage: number;
  isSafe: boolean;
  absentClasses: number;
  classesNeededToReachTarget: number;
  classesCanMissWhileAboveTarget: number;
}

export type AssignmentStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  deadline: string; // YYYY-MM-DD or ISO
  status: AssignmentStatus;
  createdAt: string;
}

export interface Exam {
  id: string;
  examName: string;
  subject: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "14:00"
  room: string;
  notes?: string;
  createdAt: string;
}

export type ProjectStatus = 'Not Started' | 'In Progress' | 'Under Review' | 'Completed';

export interface Project {
  id: string;
  projectName: string;
  subject: string;
  role: string;
  deadline: string; // YYYY-MM-DD
  progress: number; // 0 to 100
  status: ProjectStatus;
  notes?: string;
  createdAt: string;
}
