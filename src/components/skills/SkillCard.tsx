'use client';

import React, { useState } from 'react';
import { Skill } from '@/types/skills';
import { useSkills } from '@/context/SkillsContext';
import { Badge } from '@/components/common/Badge';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Layers,
} from 'lucide-react';

interface SkillCardProps {
  skill: Skill;
  onEdit: (skill: Skill) => void;
}

export function SkillCard({ skill, onEdit }: SkillCardProps) {
  const { toggleMilestone, addMilestone, deleteMilestone, deleteSkill } = useSkills();

  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);

  const handleAddMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneText.trim()) return;
    addMilestone(skill.id, newMilestoneText.trim());
    setNewMilestoneText('');
    setIsAddingMilestone(false);
  };

  const completedMilestones = skill.milestones.filter((m) => m.completed).length;

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4 shadow-xs">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="accent" size="sm">
                <Layers className="w-3 h-3 mr-1" />
                {skill.category}
              </Badge>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {skill.currentLevel} <span className="text-slate-300">→</span> {skill.targetLevel}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {skill.name}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(skill)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit Skill"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => deleteSkill(skill.id)}
              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete Skill"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Gauge */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
            <span>Overall Progress</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {skill.progress}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#0D5C46] dark:bg-emerald-500 transition-all duration-300"
              style={{ width: `${skill.progress}%` }}
            />
          </div>
        </div>

        {/* Notes */}
        {skill.notes && (
          <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50/90 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 mt-3 italic font-medium">
            &quot;{skill.notes}&quot;
          </p>
        )}

        {/* Milestones Checklist */}
        <div className="pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Milestones ({completedMilestones}/{skill.milestones.length})
            </span>
            <button
              onClick={() => setIsAddingMilestone(!isAddingMilestone)}
              className="text-[11px] font-semibold text-[#0D5C46] dark:text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>{isAddingMilestone ? 'Cancel' : 'Add Milestone'}</span>
            </button>
          </div>

          {/* New Milestone Inline Input */}
          {isAddingMilestone && (
            <form onSubmit={handleAddMilestoneSubmit} className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                placeholder="New milestone name..."
                value={newMilestoneText}
                onChange={(e) => setNewMilestoneText(e.target.value)}
                autoFocus
                className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 outline-none"
              />
              <button
                type="submit"
                disabled={!newMilestoneText.trim()}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#0D5C46] text-white disabled:opacity-50"
              >
                Save
              </button>
            </form>
          )}

          <div className="space-y-1.5">
            {skill.milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2 rounded-lg bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 text-xs group"
              >
                <button
                  onClick={() => toggleMilestone(skill.id, m.id)}
                  className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
                >
                  {m.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                  )}
                  <span
                    className={`truncate ${
                      m.completed
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-900 dark:text-slate-100 font-medium'
                    }`}
                  >
                    {m.title}
                  </span>
                </button>

                <button
                  onClick={() => deleteMilestone(skill.id, m.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                  title="Remove milestone"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Date */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Started: {skill.startDate}
        </span>
        <span>
          Updated:{' '}
          {skill.lastUpdated
            ? new Date(skill.lastUpdated).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })
            : '—'}
        </span>
      </div>
    </div>
  );
}
