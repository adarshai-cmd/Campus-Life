'use client';

import React, { useState } from 'react';
import { useCollege } from '@/context/CollegeContext';
import { AttendanceRecord, AttendanceDailyStatus } from '@/types/college';
import { calculateAttendanceStats } from '@/services/rules/attendanceMath';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { EmptyState } from '@/components/common/EmptyState';
import {
  CheckCircle2,
  XCircle,
  Plus,
  AlertTriangle,
  BookOpenCheck,
  Edit2,
  Trash2,
  TrendingUp,
  RotateCcw,
  Check,
} from 'lucide-react';

export function AttendanceTracker() {
  const {
    attendance,
    addAttendanceRecord,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    markDailyAttendance,
    undoTodayAttendance,
    getTodayAttendanceLog,
  } = useCollege();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<{ id: string; text: string; type: 'info' | 'warning' | 'success' } | null>(null);

  // Form state
  const [subjectName, setSubjectName] = useState('');
  const [totalClasses, setTotalClasses] = useState('0');
  const [attendedClasses, setAttendedClasses] = useState('0');
  const [targetPercentage, setTargetPercentage] = useState('75');
  const [error, setError] = useState('');

  const showToast = (id: string, text: string, type: 'info' | 'warning' | 'success') => {
    setToastMessage({ id, text, type });
    setTimeout(() => {
      setToastMessage((current) => (current?.id === id ? null : current));
    }, 3500);
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setSubjectName('');
    setTotalClasses('20');
    setAttendedClasses('16');
    setTargetPercentage('75');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setSubjectName(rec.subjectName);
    setTotalClasses(String(rec.totalClasses));
    setAttendedClasses(String(rec.attendedClasses));
    setTargetPercentage(String(rec.targetPercentage));
    setError('');
    setIsModalOpen(true);
  };

  const handleQuickLog = (subjectId: string, status: AttendanceDailyStatus) => {
    const res = markDailyAttendance(subjectId, status);
    if (res.duplicate) {
      showToast(subjectId, "Today's attendance is already recorded.", 'warning');
    } else {
      showToast(subjectId, res.message, 'success');
    }
  };

  const handleUndoToday = (subjectId: string) => {
    const res = undoTodayAttendance(subjectId);
    if (res.success) {
      showToast(subjectId, "Today's attendance record removed.", 'info');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectName.trim()) {
      setError('Please provide a subject name.');
      return;
    }

    const total = parseInt(totalClasses, 10);
    const attended = parseInt(attendedClasses, 10);
    const target = parseFloat(targetPercentage);

    if (isNaN(total) || total < 0) {
      setError('Total classes must be 0 or more.');
      return;
    }

    if (isNaN(attended) || attended < 0 || attended > total) {
      setError('Attended classes must be between 0 and total classes.');
      return;
    }

    if (isNaN(target) || target <= 0 || target > 100) {
      setError('Target percentage must be between 1% and 100%.');
      return;
    }

    if (editingRecord) {
      updateAttendanceRecord(editingRecord.id, {
        subjectName: subjectName.trim(),
        totalClasses: total,
        attendedClasses: attended,
        targetPercentage: target,
      });
    } else {
      addAttendanceRecord({
        subjectName: subjectName.trim(),
        totalClasses: total,
        attendedClasses: attended,
        targetPercentage: target,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Subject-Wise Attendance & Bunk Forecaster
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            One-click daily recording with duplicate protection and safe bunk calculations
          </span>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenAdd} className="gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Course Subject</span>
        </Button>
      </div>

      {attendance.length === 0 ? (
        <EmptyState
          icon={BookOpenCheck}
          title="No courses tracked yet"
          description="Add your enrolled subjects (e.g. Data Structures, Operating Systems, Mathematics) to monitor attendance and safe bunks."
          actionLabel="+ Add Course Subject"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attendance.map((rec) => {
            const stats = calculateAttendanceStats(rec);
            const absentClasses = Math.max(0, rec.totalClasses - rec.attendedClasses);
            const todayLog = getTodayAttendanceLog(rec.id);
            const hasRecordedToday = Boolean(todayLog);
            const isToastForThisSubject = toastMessage?.id === rec.id;

            return (
              <div
                key={rec.id}
                className={`glass-card rounded-2xl p-5 border transition-all ${
                  stats.isSafe
                    ? 'border-slate-200/80 dark:border-slate-800'
                    : 'border-rose-300 dark:border-rose-900/70 bg-rose-50/20 dark:bg-rose-950/20'
                }`}
              >
                {/* Subject Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {rec.subjectName}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Target: {rec.targetPercentage}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(rec)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteAttendanceRecord(rec.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Percentage & Ratio */}
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-2xl font-bold font-mono ${
                        stats.isSafe
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {stats.percentage}%
                    </span>
                    <Badge variant={stats.isSafe ? 'accent' : 'warning'} size="sm">
                      {stats.isSafe ? 'Above Target' : 'Below Target'}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-mono font-medium">
                    {rec.attendedClasses} / {rec.totalClasses} classes
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      stats.isSafe ? 'bg-[#0D5C46] dark:bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, stats.percentage)}%` }}
                  />
                </div>

                {/* Mathematical Target Logic Box */}
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-850/80 border border-slate-200/60 dark:border-slate-800 text-xs mb-3 space-y-1.5">
                  {stats.isSafe ? (
                    <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
                      <TrendingUp className="w-4 h-4 shrink-0" />
                      <span>
                        You can miss <strong>{stats.classesCanMissWhileAboveTarget}</strong> more{' '}
                        {stats.classesCanMissWhileAboveTarget === 1 ? 'class' : 'classes'} and stay
                        above {rec.targetPercentage}%.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-medium">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        Must attend <strong>{stats.classesNeededToReachTarget}</strong> consecutive{' '}
                        {stats.classesNeededToReachTarget === 1 ? 'class' : 'classes'} to reach{' '}
                        {rec.targetPercentage}%.
                      </span>
                    </div>
                  )}

                  {/* Summary Breakdown: Total, Attended, Absent */}
                  <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                    <div>
                      Total: <strong className="text-slate-900 dark:text-slate-100 font-mono">{rec.totalClasses}</strong>
                    </div>
                    <div>
                      Attended: <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{rec.attendedClasses}</strong>
                    </div>
                    <div>
                      Absent: <strong className="text-rose-700 dark:text-rose-400 font-mono">{absentClasses}</strong>
                    </div>
                  </div>
                </div>

                {/* Same-day notification & Feedback */}
                {isToastForThisSubject && (
                  <div
                    className={`mb-3 p-2 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                      toastMessage.type === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                        : toastMessage.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span>{toastMessage.text}</span>
                  </div>
                )}

                {hasRecordedToday && !isToastForThisSubject && (
                  <div className="mb-2.5 p-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Today: Marked as <strong className="capitalize">{todayLog?.status}</strong>
                    </span>
                    <button
                      onClick={() => handleUndoToday(rec.id)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors underline"
                      title="Undo today's entry"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Undo
                    </button>
                  </div>
                )}

                {/* Quick Action Buttons: [ Present ] [ Absent ] [ Edit ] */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleQuickLog(rec.id, 'present')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-[44px] rounded-xl border text-xs font-bold transition-all active:scale-95 touch-manipulation shadow-2xs ${
                      todayLog?.status === 'present'
                        ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-500/20'
                        : 'border-emerald-300/90 dark:border-emerald-800/90 bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                    }`}
                    title={hasRecordedToday && todayLog?.status === 'present' ? "Today's attendance is already recorded." : "Record Present for today"}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Present</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLog(rec.id, 'absent')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-[44px] rounded-xl border text-xs font-bold transition-all active:scale-95 touch-manipulation shadow-2xs ${
                      todayLog?.status === 'absent'
                        ? 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-500/20'
                        : 'border-rose-300/90 dark:border-rose-900/90 bg-rose-50/90 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40'
                    }`}
                    title={hasRecordedToday && todayLog?.status === 'absent' ? "Today's attendance is already recorded." : "Record Absent for today"}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Absent</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(rec)}
                    className="py-2.5 px-3 min-h-[44px] rounded-xl border border-slate-300/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition-all active:scale-95 touch-manipulation shadow-2xs flex items-center gap-1"
                    title="Manual corrections for past classes"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Edit / Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? 'Edit Attendance Record' : 'Add Subject for Attendance'}
        description="Configure total classes held, attended count, and target percentage."
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <Input
            label="Subject Name"
            placeholder="e.g. Data Structures, OS, Calculus"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Total Classes"
              type="number"
              min="0"
              value={totalClasses}
              onChange={(e) => setTotalClasses(e.target.value)}
              required
            />

            <Input
              label="Attended Classes"
              type="number"
              min="0"
              value={attendedClasses}
              onChange={(e) => setAttendedClasses(e.target.value)}
              required
            />
          </div>

          <Input
            label="Attendance Target (%)"
            type="number"
            min="1"
            max="100"
            value={targetPercentage}
            onChange={(e) => setTargetPercentage(e.target.value)}
            helperText="Standard university criterion is typically 75%."
            required
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Course
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
