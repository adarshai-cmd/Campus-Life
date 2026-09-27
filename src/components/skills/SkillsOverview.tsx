'use client';

import React from 'react';
import { useSkills } from '@/context/SkillsContext';
import { Target, CheckCircle2, Award, TrendingUp } from 'lucide-react';

export function SkillsOverview() {
  const { skills, summary } = useSkills();

  if (skills.length === 0) return null;

  const focus = summary.currentFocusSkill;
  const completedSkillsCount = skills.filter((s) => s.progress === 100).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Total Skills */}
      <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Skills
          </span>
          <Award className="w-4 h-4 text-[#0D5C46] dark:text-emerald-400" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
          {summary.totalSkills}
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          {summary.inProgressCount} in progress
        </span>
      </div>

      {/* Avg Progress */}
      <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Avg Progress
          </span>
          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
          {summary.averageProgress}%
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          {completedSkillsCount} completed
        </span>
      </div>

      {/* Milestones */}
      <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Milestones
          </span>
          <CheckCircle2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
          {summary.completedMilestonesCount}/{summary.totalMilestonesCount}
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          {summary.totalMilestonesCount > 0
            ? `${Math.round((summary.completedMilestonesCount / summary.totalMilestonesCount) * 100)}% achieved`
            : 'None added'}
        </span>
      </div>

      {/* Current Focus */}
      <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Top Focus
          </span>
          <Target className="w-4 h-4 text-amber-500 dark:text-amber-400" />
        </div>
        <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
          {focus ? focus.name : '—'}
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate block">
          {focus
            ? `${focus.progress}% (${focus.category})`
            : 'Add a skill'}
        </span>
      </div>
    </div>
  );
}
