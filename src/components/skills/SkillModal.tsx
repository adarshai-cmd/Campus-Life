'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useSkills } from '@/context/SkillsContext';
import {
  Skill,
  SKILL_LEVELS,
  SKILL_CATEGORIES,
  SkillLevel,
  SkillCategory,
  SkillMilestone,
} from '@/types/skills';
import { Plus, X } from 'lucide-react';

interface SkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Skill | null;
}

function SkillForm({
  initialData,
  onSave,
  onCancel,
}: {
  initialData?: Skill | null;
  onSave: (data: Omit<Skill, 'id' | 'createdAt' | 'lastUpdated'>) => void;
  onCancel: () => void;
}) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<SkillCategory>(
    initialData?.category || 'Programming'
  );
  const [currentLevel, setCurrentLevel] = useState<SkillLevel>(
    initialData?.currentLevel || 'Beginner'
  );
  const [targetLevel, setTargetLevel] = useState<SkillLevel>(
    initialData?.targetLevel || 'Advanced'
  );
  const [progress, setProgress] = useState(
    initialData?.progress !== undefined ? String(initialData.progress) : '20'
  );
  const [startDate, setStartDate] = useState(initialData?.startDate || todayStr);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [milestones, setMilestones] = useState<SkillMilestone[]>(
    initialData?.milestones || [
      { id: 'm1', title: 'Basics & Syntax', completed: false },
      { id: 'm2', title: 'Core Concepts & Functions', completed: false },
      { id: 'm3', title: 'Hands-on Mini Projects', completed: false },
    ]
  );
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [error, setError] = useState('');

  const handleAddMilestone = (e: React.MouseEvent) => {
    e.preventDefault();
    const trimmed = newMilestoneTitle.trim();
    if (!trimmed) return;
    setMilestones([
      ...milestones,
      {
        id: `ms_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        title: trimmed,
        completed: false,
      },
    ]);
    setNewMilestoneTitle('');
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please provide a skill name (e.g. Python, DSA, SQL).');
      return;
    }

    const prog = parseInt(progress, 10);
    const validProgress = isNaN(prog) ? 0 : Math.min(100, Math.max(0, prog));

    onSave({
      name: name.trim(),
      category,
      currentLevel,
      targetLevel,
      progress: validProgress,
      startDate: startDate || todayStr,
      notes: notes.trim() || undefined,
      milestones,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="Skill Name"
          placeholder="e.g. Python, DSA, SQL, System Design"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as SkillCategory)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
          >
            {SKILL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
            Current Level
          </label>
          <select
            value={currentLevel}
            onChange={(e) => setCurrentLevel(e.target.value as SkillLevel)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
          >
            {SKILL_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
            Target Level
          </label>
          <select
            value={targetLevel}
            onChange={(e) => setTargetLevel(e.target.value as SkillLevel)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
          >
            {SKILL_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Progress (%)"
          type="number"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <Input
          label="Notes / Learning Resources (Optional)"
          placeholder="e.g. FreeCodeCamp, LeetCode 75, Coursera"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Milestones Editor */}
      <div className="space-y-2 pt-1">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase block">
          Learning Milestones
        </label>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {milestones.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-xs"
            >
              <span className="text-slate-700 dark:text-slate-200 truncate pr-2">
                {m.title}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveMilestone(m.id)}
                className="text-slate-400 hover:text-rose-500 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder="Add milestone (e.g. Complete Dynamic Programming)..."
            value={newMilestoneTitle}
            onChange={(e) => setNewMilestoneTitle(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-white/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-700 outline-none"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddMilestone}
            disabled={!newMilestoneTitle.trim()}
            className="text-xs min-h-[32px] px-2.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? 'Update Skill' : 'Save Skill'}
        </Button>
      </div>
    </form>
  );
}

export function SkillModal({ isOpen, onClose, initialData }: SkillModalProps) {
  const { addSkill, updateSkill } = useSkills();

  const handleSave = (data: Omit<Skill, 'id' | 'createdAt' | 'lastUpdated'>) => {
    if (initialData) {
      updateSkill(initialData.id, data);
    } else {
      addSkill(data);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Skill Track' : 'Add New Skill'}
      description="Track programming languages, frameworks, interview prep, and learning milestones."
      maxWidth="md"
    >
      <SkillForm
        key={initialData?.id || (isOpen ? 'open' : 'closed')}
        initialData={initialData}
        onSave={handleSave}
        onCancel={onClose}
      />
    </Modal>
  );
}
