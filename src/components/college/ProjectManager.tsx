'use client';

import React, { useState } from 'react';
import { useCollege } from '@/context/CollegeContext';
import { Project, ProjectStatus } from '@/types/college';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { EmptyState } from '@/components/common/EmptyState';
import { Layers, Calendar, UserCheck, Plus, Edit2, Trash2 } from 'lucide-react';

export function ProjectManager() {
  const { projects, addProject, updateProject, deleteProject } = useCollege();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form
  const [projectName, setProjectName] = useState('');
  const [subject, setSubject] = useState('');
  const [role, setRole] = useState('Full Stack Lead');
  const [deadline, setDeadline] = useState('');
  const [progress, setProgress] = useState('30');
  const [status, setStatus] = useState<ProjectStatus>('In Progress');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleOpenAdd = () => {
    setEditingProject(null);
    setProjectName('');
    setSubject('');
    setRole('Team Lead');
    setDeadline(new Date().toISOString().split('T')[0]);
    setProgress('20');
    setStatus('In Progress');
    setNotes('');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    setProjectName(p.projectName);
    setSubject(p.subject);
    setRole(p.role);
    setDeadline(p.deadline);
    setProgress(String(p.progress));
    setStatus(p.status);
    setNotes(p.notes || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim()) {
      setError('Please provide a project name.');
      return;
    }

    if (!subject.trim()) {
      setError('Please provide a subject/course.');
      return;
    }

    const prog = parseInt(progress, 10);
    const validProgress = isNaN(prog) ? 0 : Math.min(100, Math.max(0, prog));

    if (editingProject) {
      updateProject(editingProject.id, {
        projectName: projectName.trim(),
        subject: subject.trim(),
        role: role.trim(),
        deadline,
        progress: validProgress,
        status,
        notes: notes.trim() || undefined,
      });
    } else {
      addProject({
        projectName: projectName.trim(),
        subject: subject.trim(),
        role: role.trim(),
        deadline,
        progress: validProgress,
        status,
        notes: notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Term & Capstone Projects
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} in development
          </span>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenAdd} className="gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No projects logged"
          description="Manage semester course projects, hackathon prototypes, group tasks, and capstones."
          actionLabel="+ Add Project"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="accent" size="sm">
                      {proj.subject}
                    </Badge>
                    <Badge
                      variant={
                        proj.status === 'Completed'
                          ? 'accent'
                          : proj.status === 'In Progress'
                          ? 'warning'
                          : 'outline'
                      }
                      size="sm"
                    >
                      {proj.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(proj)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteProject(proj.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {proj.projectName}
                </h3>

                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Role: <strong>{proj.role}</strong></span>
                </span>

                {proj.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed italic">
                    &quot;{proj.notes}&quot;
                  </p>
                )}
              </div>

              {/* Progress Slider Display */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Progress</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {proj.progress}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0D5C46] dark:bg-emerald-500 transition-all duration-300"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>

                {proj.deadline && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
                    <Calendar className="w-3 h-3" />
                    <span>Due: {proj.deadline}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Add Course / Capstone Project'}
        description="Track milestones, team roles, progress, and submission dates."
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Project Title"
              placeholder="e.g. Distributed Key-Value Store"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              autoFocus
            />

            <Input
              label="Subject / Course"
              placeholder="e.g. CS401 - Cloud Computing"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Input
              label="Your Role"
              placeholder="e.g. Backend Lead"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />

            <Input
              label="Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />

            <Input
              label="Progress (%)"
              type="number"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
              Project Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Under Review">Under Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <Input
            label="Notes / Repo Link (Optional)"
            placeholder="e.g. github.com/user/project, next viva next Tuesday"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
