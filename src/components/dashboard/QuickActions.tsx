'use client';

import React, { useState } from 'react';
import { Plus, Wallet, Plane, BookOpen, Lightbulb } from 'lucide-react';
import { ExpenseModal } from '@/components/money/ExpenseModal';
import { TripModal } from '@/components/travel/TripModal';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useCollege } from '@/context/CollegeContext';
import { SkillModal } from '@/components/skills/SkillModal';

export function QuickActions() {
  const { addAssignment } = useCollege();

  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isTripOpen, setIsTripOpen] = useState(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [isSkillOpen, setIsSkillOpen] = useState(false);

  // Quick Assignment Modal state
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentSubject, setAssignmentSubject] = useState('');
  const [assignmentDeadline, setAssignmentDeadline] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [assignmentError, setAssignmentError] = useState('');

  const handleSaveQuickAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentTitle.trim() || !assignmentSubject.trim()) {
      setAssignmentError('Title and Subject are required.');
      return;
    }

    addAssignment({
      title: assignmentTitle.trim(),
      subject: assignmentSubject.trim(),
      description: 'Logged via Quick Action',
      deadline: assignmentDeadline || new Date().toISOString().split('T')[0],
      status: 'Pending',
    });

    setAssignmentTitle('');
    setAssignmentSubject('');
    setAssignmentError('');
    setIsAssignmentOpen(false);
  };

  const actions = [
    {
      id: 'expense',
      label: 'Add Expense',
      icon: Wallet,
      accentColor:
        'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/60 dark:border-emerald-800/60',
      sublabel: 'Mess, food, bills, travel',
      onClick: () => setIsExpenseOpen(true),
    },
    {
      id: 'trip',
      label: 'Add Trip',
      icon: Plane,
      accentColor:
        'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200/60 dark:border-blue-800/60',
      sublabel: 'Home visit, weekend transit',
      onClick: () => setIsTripOpen(true),
    },
    {
      id: 'assignment',
      label: 'Add Assignment',
      icon: BookOpen,
      accentColor:
        'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200/60 dark:border-amber-800/60',
      sublabel: 'Lab records & deadlines',
      onClick: () => setIsAssignmentOpen(true),
    },
        {
      id: 'skill',
      label: 'Add Skill',
      icon: Lightbulb,
      accentColor:
        'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200/60 dark:border-purple-800/60',
      sublabel: 'Languages, DSA & roadmaps',
      onClick: () => setIsSkillOpen(true),
    },
  ];

  return (
    <>
      <section aria-labelledby="quick-actions-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            id="quick-actions-heading"
            className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
          >
            Quick Actions
          </h2>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Instant Logging
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={act.onClick}
                className="group relative flex flex-col items-start p-3.5 sm:p-4 rounded-xl glass-card text-left transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-[#0D5C46]"
              >
                <div className="flex items-center justify-between w-full mb-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center border shadow-2xs ${act.accentColor}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700/80 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#0D5C46] dark:group-hover:text-emerald-400 transition-colors">
                  + {act.label}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {act.sublabel}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Real Expense Modal */}
      <ExpenseModal isOpen={isExpenseOpen} onClose={() => setIsExpenseOpen(false)} />

      {/* Real Trip Modal */}
      <TripModal isOpen={isTripOpen} onClose={() => setIsTripOpen(false)} />

      {/* Quick Assignment Modal */}
      <Modal
        isOpen={isAssignmentOpen}
        onClose={() => setIsAssignmentOpen(false)}
        title="Quick Add Assignment"
        description="Save submission deadlines directly to your College desk."
        maxWidth="sm"
      >
        <form onSubmit={handleSaveQuickAssignment} className="space-y-4">
          {assignmentError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              {assignmentError}
            </div>
          )}

          <Input
            label="Assignment Title"
            placeholder="e.g. Lab Report 3, Problem Set 4"
            value={assignmentTitle}
            onChange={(e) => setAssignmentTitle(e.target.value)}
            autoFocus
          />

          <Input
            label="Subject"
            placeholder="e.g. CS201 - Data Structures"
            value={assignmentSubject}
            onChange={(e) => setAssignmentSubject(e.target.value)}
          />

          <Input
            label="Deadline Date"
            type="date"
            value={assignmentDeadline}
            onChange={(e) => setAssignmentDeadline(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsAssignmentOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Real Skill Modal */}
      <SkillModal
        isOpen={isSkillOpen}
        onClose={() => setIsSkillOpen(false)}
      />
    </>
  );
}
