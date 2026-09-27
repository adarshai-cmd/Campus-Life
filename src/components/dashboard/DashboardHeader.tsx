'use client';

import React, { useMemo } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { useCollege } from '@/context/CollegeContext';
import { useMoney } from '@/context/MoneyContext';
import { Badge } from '@/components/common/Badge';
import {
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wallet,
  ShieldCheck,
} from 'lucide-react';

import { useMounted } from '@/hooks/useMounted';

export function DashboardHeader() {
  const { activeProfile } = useProfile();
  const { pendingAssignments, overdueAssignments, attendance, timetable } = useCollege();
  const { analytics } = useMoney();
  const mounted = useMounted();

  const greeting = useMemo(() => {
    if (!mounted) return 'Welcome';
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, [mounted]);

  const formattedDate = useMemo(() => {
    if (!mounted) return 'Campus Life Desk';
    const now = new Date();
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(now);
  }, [mounted]);

  const studentName = activeProfile?.name || 'Student';

  // Human touches derived strictly from real data
  const academicContext = useMemo(() => {
    if (overdueAssignments.length > 0) {
      return {
        text: `${overdueAssignments.length} overdue assignment${overdueAssignments.length > 1 ? 's' : ''}`,
        icon: AlertCircle,
        variant: 'danger' as const,
      };
    }
    if (pendingAssignments.length > 0) {
      return {
        text: `${pendingAssignments.length} assignment${pendingAssignments.length > 1 ? 's' : ''} coming up`,
        icon: Clock,
        variant: 'neutral' as const,
      };
    }
    if (attendance.length > 0 || timetable.length > 0) {
      return {
        text: 'Nothing urgent today',
        icon: CheckCircle2,
        variant: 'accent' as const,
      };
    }
    return null;
  }, [overdueAssignments.length, pendingAssignments.length, attendance.length, timetable.length]);

  const moneyContext = useMemo(() => {
    const { monthlyBudget, remaining, spentThisMonth } = analytics.budget;
    if (monthlyBudget > 0) {
      if (remaining >= 0) {
        return {
          text: `₹${remaining.toLocaleString('en-IN')} left this month`,
          isOver: false,
        };
      } else {
        return {
          text: `₹${Math.abs(remaining).toLocaleString('en-IN')} over budget`,
          isOver: true,
        };
      }
    } else if (spentThisMonth > 0) {
      return {
        text: `₹${spentThisMonth.toLocaleString('en-IN')} spent this month`,
        isOver: false,
      };
    }
    return null;
  }, [analytics.budget]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/70 dark:border-slate-800/80">
      <div>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <Badge variant="accent" size="sm">
            <ShieldCheck className="w-3 h-3 mr-1 text-[#0D5C46] dark:text-emerald-400" />
            Local-First Desk
          </Badge>

          {activeProfile?.residenceLabel && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="w-3 h-3 text-slate-400" />
              {activeProfile.residenceLabel}
            </span>
          )}

          {academicContext && (
            <Badge
              variant={academicContext.variant === 'danger' ? 'danger' : academicContext.variant === 'accent' ? 'accent' : 'neutral'}
              size="sm"
            >
              <academicContext.icon className="w-3 h-3 mr-1" />
              {academicContext.text}
            </Badge>
          )}

          {moneyContext && (
            <Badge
              variant={moneyContext.isOver ? 'danger' : 'outline'}
              size="sm"
            >
              <Wallet className="w-3 h-3 mr-1" />
              {moneyContext.text}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {greeting}, {studentName}
          </h1>
          {activeProfile?.username && (
            <span className="text-xs sm:text-sm font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50/90 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800">
              @{activeProfile.username}
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{formattedDate}</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>Semester Desk</span>
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <div className="px-3 py-1.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 shadow-2xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Device Storage Active</span>
        </div>
      </div>
    </div>
  );
}
