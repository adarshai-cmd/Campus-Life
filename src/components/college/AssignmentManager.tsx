'use client';

import React, { useState, useMemo } from 'react';
import { useCollege } from '@/context/CollegeContext';
import { Assignment, AssignmentStatus } from '@/types/college';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
} from 'lucide-react';

export function AssignmentManager() {
  const {
    assignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    toggleAssignmentStatus,
    overdueAssignments,
  } = useCollege();

  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>(
    'All'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<AssignmentStatus>('Pending');
  const [error, setError] = useState('');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const filteredAssignments = useMemo(() => {
    return assignments
      .filter((a) => {
        if (activeTab === 'All') return true;
        return a.status === activeTab;
      })
      .sort((a, b) => a.deadline.localeCompare(b.deadline));
  }, [assignments, activeTab]);

  const handleOpenAdd = () => {
    setEditingAssignment(null);
    setTitle('');
    setSubject('');
    setDescription('');
    setDeadline(todayStr);
    setStatus('Pending');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: Assignment) => {
    setEditingAssignment(a);
    setTitle(a.title);
    setSubject(a.subject);
    setDescription(a.description);
    setDeadline(a.deadline);
    setStatus(a.status);
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please provide an assignment title.');
      return;
    }

    if (!subject.trim()) {
      setError('Please provide a course subject.');
      return;
    }

    if (!deadline) {
      setError('Please specify a submission deadline.');
      return;
    }

    if (editingAssignment) {
      updateAssignment(editingAssignment.id, {
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        deadline,
        status,
      });
    } else {
      addAssignment({
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        deadline,
        status,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Overdue Warning Callout */}
      {overdueAssignments.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>
              <strong>{overdueAssignments.length} overdue</strong>{' '}
              {overdueAssignments.length === 1 ? 'assignment needs' : 'assignments need'}{' '}
              submission: {overdueAssignments.map((a) => a.title).join(', ')}.
            </span>
          </div>
          <span className="font-semibold uppercase tracking-wider text-[10px] bg-rose-200/80 dark:bg-rose-900 px-2 py-0.5 rounded">
            Immediate Attention
          </span>
        </div>
      )}

      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-850/80 p-1 rounded-xl border border-slate-200/70 dark:border-slate-800 text-xs">
          {(['All', 'Pending', 'In Progress', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenAdd} className="gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Assignment</span>
        </Button>
      </div>

      {/* List */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No assignments due"
          description={
            assignments.length === 0
              ? "You're all caught up for the week. Add homework, problem sets, or lab submissions."
              : `No assignments currently in "${activeTab}" status.`
          }
          actionLabel={assignments.length === 0 ? '+ Add Assignment' : undefined}
          onAction={assignments.length === 0 ? handleOpenAdd : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredAssignments.map((item) => {
            const isOverdue = item.status !== 'Completed' && item.deadline < todayStr;
            const formattedDeadline = new Date(item.deadline + 'T00:00:00').toLocaleDateString(
              undefined,
              {
                month: 'short',
                day: 'numeric',
                weekday: 'short',
              }
            );

            return (
              <div
                key={item.id}
                className={`glass-card rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between ${
                  isOverdue
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-xs font-semibold text-[#0D5C46] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
                      {item.subject}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Assignment"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteAssignment(item.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span
                      className={`font-semibold ${
                        isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {formattedDeadline} {isOverdue && '(Overdue)'}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleAssignmentStatus(item.id)}
                    title="Click to cycle status"
                    className="cursor-pointer"
                  >
                    <Badge
                      variant={
                        item.status === 'Completed'
                          ? 'accent'
                          : item.status === 'In Progress'
                          ? 'warning'
                          : 'outline'
                      }
                      size="sm"
                    >
                      {item.status === 'Completed' ? (
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {item.status}
                    </Badge>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAssignment ? 'Edit Assignment' : 'Add Assignment'}
        description="Track project deliverables, homework, and lab write-ups."
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <Input
            label="Assignment Title"
            placeholder="e.g. Binary Search Tree Lab Report 3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Subject / Course"
              placeholder="e.g. CS201 - Data Structures"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <Input
              label="Deadline Date"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
              Current Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AssignmentStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <Input
            label="Description / Tasks (Optional)"
            placeholder="e.g. Implement AVL rotations in C++ and plot graphs"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
