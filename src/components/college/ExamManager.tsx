'use client';

import React, { useState } from 'react';
import { useCollege } from '@/context/CollegeContext';
import { Exam } from '@/types/college';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { EmptyState } from '@/components/common/EmptyState';
import { Calendar, Clock, MapPin, Plus, Edit2, Trash2, Award } from 'lucide-react';

export function ExamManager() {
  const { exams, addExam, updateExam, deleteExam, upcomingExams } = useCollege();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Form
  const [examName, setExamName] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [room, setRoom] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleOpenAdd = () => {
    setEditingExam(null);
    setExamName('');
    setSubject('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('10:00');
    setRoom('Exam Hall A');
    setNotes('');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: Exam) => {
    setEditingExam(exam);
    setExamName(exam.examName);
    setSubject(exam.subject);
    setDate(exam.date);
    setTime(exam.time);
    setRoom(exam.room);
    setNotes(exam.notes || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!examName.trim()) {
      setError('Please provide an exam title (e.g. Midterm, End-Sem, Quiz 2).');
      return;
    }

    if (!subject.trim()) {
      setError('Please provide a subject.');
      return;
    }

    if (!date) {
      setError('Please specify the exam date.');
      return;
    }

    if (editingExam) {
      updateExam(editingExam.id, {
        examName: examName.trim(),
        subject: subject.trim(),
        date,
        time,
        room: room.trim(),
        notes: notes.trim() || undefined,
      });
    } else {
      addExam({
        examName: examName.trim(),
        subject: subject.trim(),
        date,
        time,
        room: room.trim(),
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
            Examinations & Vivas
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {upcomingExams.length} upcoming {upcomingExams.length === 1 ? 'exam' : 'exams'} scheduled
          </span>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenAdd} className="gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Exam</span>
        </Button>
      </div>

      {exams.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No exams scheduled"
          description="Track university mid-terms, final theory papers, lab vivas, and classroom quizzes."
          actionLabel="+ Add Exam"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {exams.map((exam) => {
            const formattedDate = new Date(exam.date + 'T00:00:00').toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={exam.id}
                className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <Badge variant="accent" size="sm">
                      {exam.subject}
                    </Badge>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(exam)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Exam"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteExam(exam.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {exam.examName}
                  </h3>

                  {exam.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic font-medium">
                      &quot;{exam.notes}&quot;
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      {formattedDate}
                    </span>
                    {exam.time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        {exam.time}
                      </span>
                    )}
                  </div>

                  {exam.room && (
                    <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      {exam.room}
                    </span>
                  )}
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
        title={editingExam ? 'Edit Exam' : 'Schedule Exam / Viva'}
        description="Save exam dates, reporting times, and venue hall locations."
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
              label="Exam Name"
              placeholder="e.g. End Semester Theory / Viva"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              autoFocus
            />

            <Input
              label="Subject"
              placeholder="e.g. Operating Systems"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Input
              label="Exam Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <Input
              label="Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />

            <Input
              label="Exam Hall / Room"
              placeholder="e.g. Hall 2B, Desk 14"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
          </div>

          <Input
            label="Notes (Optional)"
            placeholder="e.g. Scientific calculator allowed, admit card needed"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Exam
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
