'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  TimetableSlot,
  AttendanceRecord,
  AttendanceDailyLog,
  AttendanceDailyStatus,
  Assignment,
  Exam,
  Project,
  AssignmentStatus,
} from '@/types/college';
import { storageService } from '@/services/storage/storageService';
import { useProfile } from './ProfileContext';
import { calculateAttendanceStats } from '@/services/rules/attendanceMath';
import { getLocalDateString } from '@/utils/dateUtils';

interface MarkAttendanceResult {
  success: boolean;
  message: string;
  duplicate?: boolean;
}

interface CollegeContextType {
  // Timetable
  timetable: TimetableSlot[];
  addTimetableSlot: (data: Omit<TimetableSlot, 'id'>) => TimetableSlot;
  updateTimetableSlot: (id: string, updates: Partial<TimetableSlot>) => void;
  deleteTimetableSlot: (id: string) => void;

  // Attendance
  attendance: AttendanceRecord[];
  attendanceLogs: AttendanceDailyLog[];
  addAttendanceRecord: (data: Omit<AttendanceRecord, 'id'>) => AttendanceRecord;
  updateAttendanceRecord: (id: string, updates: Partial<AttendanceRecord>) => void;
  deleteAttendanceRecord: (id: string) => void;
  getTodayAttendanceLog: (subjectId: string) => AttendanceDailyLog | undefined;
  markDailyAttendance: (subjectId: string, status: AttendanceDailyStatus) => MarkAttendanceResult;
  undoTodayAttendance: (subjectId: string) => MarkAttendanceResult;
  markAttendance: (id: string, attended: boolean) => void;

  // Assignments
  assignments: Assignment[];
  addAssignment: (data: Omit<Assignment, 'id' | 'createdAt'>) => Assignment;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  toggleAssignmentStatus: (id: string) => void;

  // Exams
  exams: Exam[];
  addExam: (data: Omit<Exam, 'id' | 'createdAt'>) => Exam;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => void;

  // Projects
  projects: Project[];
  addProject: (data: Omit<Project, 'id' | 'createdAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Computed Summaries
  overdueAssignments: Assignment[];
  pendingAssignments: Assignment[];
  upcomingExams: Exam[];
  overallAttendancePercentage: number;
  criticalAttendanceCount: number;
}

const CollegeContext = createContext<CollegeContextType | undefined>(undefined);

const STORAGE_KEY_TIMETABLE = 'college_timetable_v2';
const STORAGE_KEY_ATTENDANCE = 'college_attendance_v2';
const STORAGE_KEY_ATTENDANCE_LOGS = 'college_attendance_logs_v2';
const STORAGE_KEY_ASSIGNMENTS = 'college_assignments_v2';
const STORAGE_KEY_EXAMS = 'college_exams_v2';
const STORAGE_KEY_PROJECTS = 'college_projects_v2';

export function CollegeProvider({ children }: { children: React.ReactNode }) {
  const { activeProfile } = useProfile();
  const profileId = activeProfile?.id;

  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    if (!profileId) return [];
    return storageService.getItem<TimetableSlot[]>(profileId, STORAGE_KEY_TIMETABLE) || [];
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    if (!profileId) return [];
    return storageService.getItem<AttendanceRecord[]>(profileId, STORAGE_KEY_ATTENDANCE) || [];
  });

  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceDailyLog[]>(() => {
    if (!profileId) return [];
    return storageService.getItem<AttendanceDailyLog[]>(profileId, STORAGE_KEY_ATTENDANCE_LOGS) || [];
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    if (!profileId) return [];
    return storageService.getItem<Assignment[]>(profileId, STORAGE_KEY_ASSIGNMENTS) || [];
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    if (!profileId) return [];
    return storageService.getItem<Exam[]>(profileId, STORAGE_KEY_EXAMS) || [];
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    if (!profileId) return [];
    return storageService.getItem<Project[]>(profileId, STORAGE_KEY_PROJECTS) || [];
  });

  // --- Timetable Actions ---
  const addTimetableSlot = useCallback(
    (data: Omit<TimetableSlot, 'id'>): TimetableSlot => {
      const newSlot: TimetableSlot = {
        ...data,
        id: `slot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      };
      setTimetable((prev) => {
        const next = [...prev, newSlot];
        if (profileId) storageService.setItem(profileId, STORAGE_KEY_TIMETABLE, next);
        return next;
      });
      return newSlot;
    },
    [profileId]
  );

  const updateTimetableSlot = useCallback(
    (id: string, updates: Partial<TimetableSlot>) => {
      setTimetable((prev) => {
        const next = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
        if (profileId) storageService.setItem(profileId, STORAGE_KEY_TIMETABLE, next);
        return next;
      });
    },
    [profileId]
  );

  const deleteTimetableSlot = useCallback(
    (id: string) => {
      setTimetable((prev) => {
        const next = prev.filter((s) => s.id !== id);
        if (profileId) storageService.setItem(profileId, STORAGE_KEY_TIMETABLE, next);
        return next;
      });
    },
    [profileId]
  );

  // --- Attendance Actions ---
  const addAttendanceRecord = useCallback(
    (data: Omit<AttendanceRecord, 'id'>): AttendanceRecord => {
      const newRecord: AttendanceRecord = {
        ...data,
        id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      };
      setAttendance((prev) => {
        const next = [...prev, newRecord];
        if (profileId) storageService.setItem(profileId, STORAGE_KEY_ATTENDANCE, next);
        return next;
      });
      return newRecord;
    },
    [profileId]
  );

  const updateAttendanceRecord = useCallback(
    (id: string, updates: Partial<AttendanceRecord>) => {
      setAttendance((prev) => {
        const next = prev.map((r) => (r.id === id ? { ...r, ...updates } : r));
        if (profileId) storageService.setItem(profileId, STORAGE_KEY_ATTENDANCE, next);
        return next;
      });
    },
    [profileId]
  );

  const deleteAttendanceRecord = useCallback(
    (id: string) => {
      setAttendance((prev) => {
        const next = prev.filter((r) => r.id !== id);
        if (profileId) storageService.setItem(profileId, STORAGE_KEY_ATTENDANCE, next);
        return next;
      });
      // Also clean associated daily logs
      setAttendanceLogs((prev) => {
        const next = prev.filter((l) => l.subjectId !== id);
        if (profileId) storageService.setItem(profileId, STORAGE_KEY_ATTENDANCE_LOGS, next);
        return next;
      });
    },
    [profileId]
  );

  const getTodayAttendanceLog = useCallback(
    (subjectId: string): AttendanceDailyLog | undefined => {
      const today = getLocalDateString();
      return attendanceLogs.find((l) => l.subjectId === subjectId && l.date === today);
    },
    [attendanceLogs]
  );

  const markDailyAttendance = useCallback(
    (subjectId: string, status: AttendanceDailyStatus): MarkAttendanceResult => {
      const today = getLocalDateString();
      const existingLog = attendanceLogs.find((l) => l.subjectId === subjectId && l.date === today);

      // Check if already recorded today
      if (existingLog) {
        if (existingLog.status === status) {
          return {
            success: false,
            message: "Today's attendance is already recorded.",
            duplicate: true,
          };
        }

        // Status is being changed/corrected for today (e.g. absent -> present or present -> absent)
        const newLogs = attendanceLogs.map((l) =>
          l.id === existingLog.id ? { ...l, status, timestamp: new Date().toISOString() } : l
        );
        setAttendanceLogs(newLogs);
        if (profileId) storageService.setItem(profileId, STORAGE_KEY_ATTENDANCE_LOGS, newLogs);

        // Adjust attended count without changing total classes
        setAttendance((prev) => {
          const next = prev.map((r) => {
            if (r.id !== subjectId) return r;
            const diff = status === 'present' ? 1 : -1;
            const newAttended = Math.max(0, Math.min(r.totalClasses, r.attendedClasses + diff));
            return { ...r, attendedClasses: newAttended };
          });
          if (profileId) storageService.setItem(profileId, STORAGE_KEY_ATTENDANCE, next);
          return next;
        });

        return {
          success: true,
          message: `Today's attendance corrected to ${status}.`,
        };
      }

      // First time recording today: increment totalClasses by 1
      const newLog: AttendanceDailyLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        subjectId,
        date: today,
        status,
        timestamp: new Date().toISOString(),
      };

      const updatedLogs = [newLog, ...attendanceLogs];
      setAttendanceLogs(updatedLogs);
      if (profileId) storageService.setItem(profileId, STORAGE_KEY_ATTENDANCE_LOGS, updatedLogs);

      setAttendance((prev) => {
        const next = prev.map((r) => {
          if (r.id !== subjectId) return r;
          const newTotal = r.totalClasses + 1;
          const newAttended = status === 'present' ? r.attendedClasses + 1 : r.attendedClasses;
          return {
            ...r,
            totalClasses: newTotal,
            attendedClasses: newAttended,
          };
        });
        if (profileId) storageService.setItem(profileId, STORAGE_KEY_ATTENDANCE, next);
        return next;
      });

      return {
        success: true,
        message: `Marked ${status} for today.`,
      };
    },
    [attendanceLogs, profileId]
  );

  const undoTodayAttendance = useCallback(
    (subjectId: string): MarkAttendanceResult => {
      const today = getLocalDateString();
      const existingLog = attendanceLogs.find((l) => l.subjectId === subjectId && l.date === today);

      if (!existingLog) {
        return { success: false, message: 'No attendance entry recorded for today.' };
      }

      const updatedLogs = attendanceLogs.filter((l) => l.id !== existingLog.id);
      setAttendanceLogs(updatedLogs);
      if (profileId) storageService.setItem(profileId, STORAGE_KEY_ATTENDANCE_LOGS, updatedLogs);

      setAttendance((prev) => {
        const next = prev.map((r) => {
          if (r.id !== subjectId) return r;
          const newTotal = Math.max(0, r.totalClasses - 1);
          const newAttended =
            existingLog.status === 'present'
              ? Math.max(0, r.attendedClasses - 1)
              : r.attendedClasses;
          return {
            ...r,
            totalClasses: newTotal,
            attendedClasses: Math.min(newTotal, newAttended),
          };
        });
        if (profileId) storageService.setItem(profileId, STORAGE_KEY_ATTENDANCE, next);
        return next;
      });

      return {
        success: true,
        message: "Today's attendance entry reverted.",
      };
    },
    [attendanceLogs, profileId]
  );

  // Backward compatibility wrapper
  const markAttendance = useCallback(
    (id: string, attended: boolean) => {
      markDailyAttendance(id, attended ? 'present' : 'absent');
    },
    [markDailyAttendance]
  );

  // --- Assignment Actions ---
  const addAssignment = useCallback(
    (data: Omit<Assignment, 'id' | 'createdAt'>): Assignment => {
      const newAssignment: Assignment = {
        ...data,
        id: `ass_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      setAssignments((prev) => {
        const next = [newAssignment, ...prev];
        if (profileId) storageService.setItem(profileId, STORAGE_KEY_ASSIGNMENTS, next);
        return next;
      });
      return newAssignment;
    },
    [profileId]
  );

  const updateAssignment = useCallback(
    (id: string, updates: Partial<Assignment>) => {
      setAssignments((prev) => {
        const next = prev.map((a) => (a.id === id ? { ...a, ...updates } : a));
        if (profileId) storageService.setItem(profileId, STORAGE_KEY_ASSIGNMENTS, next);
        return next;
      });
    },
    [profileId]
  );

  const deleteAssignment = useCallback(
    (id: string) => {
      setAssignments((prev) => {
        const next = prev.filter((a) => a.id !== id);
        if (profileId) storageService.setItem(profileId, STORAGE_KEY_ASSIGNMENTS, next);
        return next;
      });
    },
    [profileId]
  );

  const toggleAssignmentStatus = useCallback(
    (id: string) => {
      setAssignments((prev) => {
        const next = prev.map((a) => {
          if (a.id !== id) return a;
          let nextStatus: AssignmentStatus = 'In Progress';
          if (a.status === 'Pending') nextStatus = 'In Progress';
          else if (a.status === 'In Progress') nextStatus = 'Completed';
          else nextStatus = 'Pending';
          return { ...a, status: nextStatus };
        });
        if (profileId) storageService.setItem(profileId, STORAGE_KEY_ASSIGNMENTS, next);
        return next;
      });
    },
    [profileId]
  );

  // --- Exam Actions ---
  const addExam = useCallback(
    (data: Omit<Exam, 'id' | 'createdAt'>): Exam => {
      const newExam: Exam = {
        ...data,
        id: `exam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      setExams((prev) => {
        const next = [newExam, ...prev];
        if (profileId) storageService.setItem(profileId, STORAGE_KEY_EXAMS, next);
        return next;
      });
      return newExam;
    },
    [profileId]
  );

  const updateExam = useCallback(
    (id: string, updates: Partial<Exam>) => {
      setExams((prev) => {
        const next = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
        if (profileId) storageService.setItem(profileId, STORAGE_KEY_EXAMS, next);
        return next;
      });
    },
    [profileId]
  );

  const deleteExam = useCallback(
    (id: string) => {
      setExams((prev) => {
        const next = prev.filter((e) => e.id !== id);
        if (profileId) storageService.setItem(profileId, STORAGE_KEY_EXAMS, next);
        return next;
      });
    },
    [profileId]
  );

  // --- Project Actions ---
  const addProject = useCallback(
    (data: Omit<Project, 'id' | 'createdAt'>): Project => {
      const newProject: Project = {
        ...data,
        id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      setProjects((prev) => {
        const next = [newProject, ...prev];
        if (profileId) storageService.setItem(profileId, STORAGE_KEY_PROJECTS, next);
        return next;
      });
      return newProject;
    },
    [profileId]
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<Project>) => {
      setProjects((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
        if (profileId) storageService.setItem(profileId, STORAGE_KEY_PROJECTS, next);
        return next;
      });
    },
    [profileId]
  );

  const deleteProject = useCallback(
    (id: string) => {
      setProjects((prev) => {
        const next = prev.filter((p) => p.id !== id);
        if (profileId) storageService.setItem(profileId, STORAGE_KEY_PROJECTS, next);
        return next;
      });
    },
    [profileId]
  );

  // --- Computed Summaries ---
  const todayStr = useMemo(() => getLocalDateString(), []);

  const overdueAssignments = useMemo(() => {
    return assignments.filter((a) => a.status !== 'Completed' && a.deadline < todayStr);
  }, [assignments, todayStr]);

  const pendingAssignments = useMemo(() => {
    return assignments.filter((a) => a.status !== 'Completed');
  }, [assignments]);

  const upcomingExams = useMemo(() => {
    return exams
      .filter((e) => e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [exams, todayStr]);

  const { overallAttendancePercentage, criticalAttendanceCount } = useMemo(() => {
    if (attendance.length === 0) {
      return { overallAttendancePercentage: 100, criticalAttendanceCount: 0 };
    }

    let totalClassesHeld = 0;
    let totalClassesAttended = 0;
    let criticalCount = 0;

    for (const rec of attendance) {
      totalClassesHeld += rec.totalClasses;
      totalClassesAttended += rec.attendedClasses;

      const stats = calculateAttendanceStats(rec);
      if (!stats.isSafe) {
        criticalCount++;
      }
    }

    const pct = totalClassesHeld > 0 ? (totalClassesAttended / totalClassesHeld) * 100 : 100;

    return {
      overallAttendancePercentage: Math.round(pct * 10) / 10,
      criticalAttendanceCount: criticalCount,
    };
  }, [attendance]);

  return (
    <CollegeContext.Provider
      value={{
        timetable,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        attendance,
        attendanceLogs,
        addAttendanceRecord,
        updateAttendanceRecord,
        deleteAttendanceRecord,
        getTodayAttendanceLog,
        markDailyAttendance,
        undoTodayAttendance,
        markAttendance,
        assignments,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        toggleAssignmentStatus,
        exams,
        addExam,
        updateExam,
        deleteExam,
        projects,
        addProject,
        updateProject,
        deleteProject,
        overdueAssignments,
        pendingAssignments,
        upcomingExams,
        overallAttendancePercentage,
        criticalAttendanceCount,
      }}
    >
      {children}
    </CollegeContext.Provider>
  );
}

export function useCollege() {
  const context = useContext(CollegeContext);
  if (!context) {
    throw new Error('useCollege must be used within a CollegeProvider');
  }
  return context;
}
