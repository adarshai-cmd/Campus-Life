'use client';

import React from 'react';
import Link from 'next/link';
import { Lightbulb, ArrowUpRight } from 'lucide-react';
import { useSkills } from '@/context/SkillsContext';

export function SkillsOverviewCard() {
  const { skills, summary } = useSkills();
  const focus = summary.currentFocusSkill;

  const activeSkillsCount = skills.length;
  const currentFocusName = focus ? focus.name : skills[0]?.name || 'None set';
  const currentProgress = focus ? focus.progress : summary.averageProgress;

  return (
    <Link
      href="/skills"
      className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-amber-500/50 dark:hover:border-amber-400/50 hover:shadow-md transition-all cursor-pointer group select-none block"
      aria-label="Open Skills Dashboard"
    >
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/60 group-hover:scale-105 transition-transform">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                SKILLS
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Growth & Roadmaps
              </span>
            </div>
          </div>
          <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:bg-amber-50/60 dark:group-hover:bg-amber-950/40 transition-all">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Structured Summary Rows */}
        <div className="py-4 space-y-2.5">
          {/* Active Skills */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Active Skills
            </span>
            <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
              {activeSkillsCount}
            </span>
          </div>

          {/* Current Focus */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Current Focus
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[60%]">
              {currentFocusName}
            </span>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Progress
            </span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 dark:bg-amber-400 transition-all"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                {currentProgress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation Cue */}
      <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/70 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">
          {summary.completedMilestonesCount}/{summary.totalMilestonesCount} milestones done
        </span>
        <span className="text-amber-600 dark:text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
          Open Skills Dashboard →
        </span>
      </div>
    </Link>
  );
}
