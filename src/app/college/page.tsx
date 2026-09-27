'use client';

import React, { useState } from 'react';
import { GraduationCap, Calendar, Clock, BookOpen, Award, Layers } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { AttendanceTracker } from '@/components/college/AttendanceTracker';
import { TimetableManager } from '@/components/college/TimetableManager';
import { AssignmentManager } from '@/components/college/AssignmentManager';
import { ExamManager } from '@/components/college/ExamManager';
import { ProjectManager } from '@/components/college/ProjectManager';
import { useCollege } from '@/context/CollegeContext';

type CollegeTab = 'attendance' | 'timetable' | 'assignments' | 'exams' | 'projects';

export default function CollegePage() {
  const [activeTab, setActiveTab] = useState<CollegeTab>('attendance');

  const {
    overallAttendancePercentage,
    criticalAttendanceCount,
    overdueAssignments,
    pendingAssignments,
    upcomingExams,
  } = useCollege();

  const tabs: { id: CollegeTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string | number; badgeVariant?: 'neutral' | 'accent' | 'warning' }[] = [
    {
      id: 'attendance',
      label: 'Attendance',
      icon: Clock,
      badge: `${overallAttendancePercentage}%`,
      badgeVariant: criticalAttendanceCount > 0 ? 'warning' : 'accent',
    },
    {
      id: 'timetable',
      label: 'Timetable',
      icon: Calendar,
    },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: BookOpen,
      badge: pendingAssignments.length > 0 ? pendingAssignments.length : undefined,
      badgeVariant: overdueAssignments.length > 0 ? 'warning' : 'neutral',
    },
    {
      id: 'exams',
      label: 'Exams',
      icon: Award,
      badge: upcomingExams.length > 0 ? upcomingExams.length : undefined,
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Layers,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="accent" size="sm">
              <GraduationCap className="w-3.5 h-3.5 mr-1" />
              Academics Desk
            </Badge>
            <Badge variant={criticalAttendanceCount > 0 ? 'warning' : 'neutral'} size="sm">
              Overall Attendance: {overallAttendancePercentage}%
            </Badge>
            {overdueAssignments.length > 0 && (
              <Badge variant="warning" size="sm">
                {overdueAssignments.length} Overdue
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            College & Academics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Weekly class timetable, 75% attendance buffer forecaster, assignment deadlines, and exam dates.
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/60 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#0D5C46] text-white dark:bg-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.badgeVariant === 'warning'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="pt-2">
        {activeTab === 'attendance' && <AttendanceTracker />}
        {activeTab === 'timetable' && <TimetableManager />}
        {activeTab === 'assignments' && <AssignmentManager />}
        {activeTab === 'exams' && <ExamManager />}
        {activeTab === 'projects' && <ProjectManager />}
      </div>
    </div>
  );
}
