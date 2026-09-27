'use client';

import React, { useState, useMemo } from 'react';
import { useCollege } from '@/context/CollegeContext';
import { TimetableSlot, DayOfWeek, DAYS_OF_WEEK } from '@/types/college';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { EmptyState } from '@/components/common/EmptyState';
import { Calendar, Clock, MapPin, User, Plus, Edit2, Trash2 } from 'lucide-react';

export function TimetableManager() {
  const { timetable, addTimetableSlot, updateTimetableSlot, deleteTimetableSlot } = useCollege();

  // Current day of week as initial tab
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => {
    const dayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
    const map: DayOfWeek[] = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return map[dayIndex] || 'Monday';
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  // Form
  const [day, setDay] = useState<DayOfWeek>('Monday');
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [classroom, setClassroom] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const currentSlots = useMemo(() => {
    return timetable
      .filter((s) => s.day === selectedDay)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [timetable, selectedDay]);

  const handleOpenAdd = () => {
    setEditingSlot(null);
    setDay(selectedDay);
    setSubject('');
    setTeacher('');
    setStartTime('09:00');
    setEndTime('10:00');
    setClassroom('LT-3');
    setNotes('');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setDay(slot.day);
    setSubject(slot.subject);
    setTeacher(slot.teacher);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setClassroom(slot.classroom);
    setNotes(slot.notes || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      setError('Please provide a subject name.');
      return;
    }

    if (!startTime || !endTime) {
      setError('Please provide valid start and end times.');
      return;
    }

    if (editingSlot) {
      updateTimetableSlot(editingSlot.id, {
        day,
        subject: subject.trim(),
        teacher: teacher.trim(),
        startTime,
        endTime,
        classroom: classroom.trim(),
        notes: notes.trim() || undefined,
      });
    } else {
      addTimetableSlot({
        day,
        subject: subject.trim(),
        teacher: teacher.trim(),
        startTime,
        endTime,
        classroom: classroom.trim(),
        notes: notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Weekly Class Schedule
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Lecture timetable with room locations and teachers
          </span>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenAdd} className="gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Class Slot</span>
        </Button>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {DAYS_OF_WEEK.map((d) => {
          const isSelected = selectedDay === d;
          const count = timetable.filter((s) => s.day === d).length;

          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#0D5C46] text-white dark:bg-emerald-600 shadow-xs'
                  : 'bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100'
              }`}
            >
              <span>{d.slice(0, 3)}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Slots List */}
      {currentSlots.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={`No classes on ${selectedDay}`}
          description="Enjoy your study session, or add lecture periods and lab slots for this day."
          actionLabel="+ Add Class Slot"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {currentSlots.map((slot) => (
            <div
              key={slot.id}
              className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="accent" size="sm">
                    <Clock className="w-3 h-3 mr-1" />
                    {slot.startTime} - {slot.endTime}
                  </Badge>
                  {slot.classroom && (
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                      {slot.classroom}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {slot.subject}
                  </h3>
                  {slot.teacher && (
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                      {slot.teacher}
                    </span>
                  )}
                </div>

                {slot.notes && (
                  <p className="text-xs text-slate-700 dark:text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-800">
                    &quot;{slot.notes}&quot;
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEdit(slot)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit Slot"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteTimetableSlot(slot.id)}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete Slot"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSlot ? 'Edit Class Slot' : 'Add Class Slot'}
        description="Schedule lectures, lab sessions, and classroom assignments."
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
              label="Subject"
              placeholder="e.g. Computer Networks, Math III"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              autoFocus
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                Day of Week
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Input
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />

            <Input
              label="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />

            <Input
              label="Classroom / Room"
              placeholder="e.g. Hall 4, Lab 2"
              value={classroom}
              onChange={(e) => setClassroom(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Teacher / Professor"
              placeholder="e.g. Dr. Sharma"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
            />

            <Input
              label="Notes (Optional)"
              placeholder="e.g. Bring lab coat, submit tutorial"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Slot
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
