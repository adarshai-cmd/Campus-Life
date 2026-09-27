'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowUpRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCollege } from '@/context/CollegeContext';

export function CollegeOverviewCard() {
  const {
    attendance,
    overallAttendancePercentage,
    criticalAttendanceCount,
    pendingAssignments,
    overdueAssignments,
    projects,
  } = useCollege();

  const activeProjects = projects.filter((p) => p.status !== 'Completed');

  return (
    <Link
      href="/college"
      className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-[#0D5C46]/50 dark:hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group select-none block"
      aria-label="Open College Dashboard"
    >
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#0D5C46] dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/60 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#0D5C46] dark:group-hover:text-emerald-400 transition-colors">
                COLLEGE
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Academics & Attendance
              </span>
            </div>
          </div>
          <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-[#0D5C46] dark:group-hover:text-emerald-400 group-hover:bg-emerald-50/60 dark:group-hover:bg-emerald-950/40 transition-all">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Structured Summary Rows */}
        <div className="py-4 space-y-2.5">
          {/* Attendance */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Attendance
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                {attendance.length > 0 ? `${overallAttendancePercentage}%` : '0%'}
              </span>
              {criticalAttendanceCount > 0 ? (
                <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                  {criticalAttendanceCount} low
                </span>
              ) : attendance.length > 0 ? (
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  On track
                </span>
              ) : (
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">0 subjects</span>
              )}
            </div>
          </div>

          {/* Assignments */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Assignments
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                {pendingAssignments.length} upcoming
              </span>
              {overdueAssignments.length > 0 && (
                <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800 flex items-center gap-0.5">
                  <AlertCircle className="w-3 h-3" />
                  {overdueAssignments.length} overdue
                </span>
              )}
            </div>
          </div>

          {/* Projects */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Projects
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                {activeProjects.length} active
              </span>
              {projects.length > activeProjects.length && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {projects.length - activeProjects.length} done
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation Cue */}
      <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/70 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">
          {attendance.length} registered {attendance.length === 1 ? 'subject' : 'subjects'}
        </span>
        <span className="text-[#0D5C46] dark:text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
          Open College Dashboard →
        </span>
      </div>
    </Link>
  );
}
