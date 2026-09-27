'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useProfile } from '@/context/ProfileContext';
import { CreateProfileModal } from './CreateProfileModal';
import { Check, Plus, Trash2 } from 'lucide-react';

interface ProfileSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSwitcherModal({ isOpen, onClose }: ProfileSwitcherModalProps) {
  const { profiles, activeProfile, switchProfile, deleteProfile } = useProfile();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleSelect = (profileId: string) => {
    switchProfile(profileId);
    onClose();
  };

  const handleConfirmDelete = () => {
    if (!profileToDelete) return;
    deleteProfile(profileToDelete.id);
    setProfileToDelete(null);
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !isCreateOpen && !profileToDelete}
        onClose={onClose}
        title="Switch Profile"
        description="Select a student profile. Each profile maintains completely isolated data."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {profiles.map((p) => {
              const isActive = activeProfile?.id === p.id;
              const initial = p.name.charAt(0).toUpperCase();

              return (
                <div
                  key={p.id}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-150 select-none group ${
                    isActive
                      ? 'bg-emerald-50/70 border-[#0D5C46]/40 dark:bg-emerald-950/30 dark:border-emerald-700/60 ring-1 ring-[#0D5C46]/20'
                      : 'bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-850'
                  }`}
                >
                  <div
                    onClick={() => handleSelect(p.id)}
                    className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
                      style={{ backgroundColor: p.avatarColor }}
                    >
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {p.name}
                        </span>
                        {p.username && (
                          <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50/90 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200/80 dark:border-emerald-800">
                            @{p.username}
                          </span>
                        )}
                        {isActive && (
                          <Badge variant="accent" size="sm">
                            Active
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
                        {p.residenceLabel || 'Campus / Hostel'} · Joined{' '}
                        {new Date(p.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 ml-2">
                    {isActive ? (
                      <div className="w-7 h-7 rounded-full bg-[#0D5C46] text-white dark:bg-emerald-500 dark:text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSelect(p.id)}
                          className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1 rounded bg-slate-100/80 dark:bg-slate-800"
                        >
                          Switch
                        </button>

                        {profiles.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProfileToDelete({ id: p.id, name: p.name });
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            title={`Delete profile ${p.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Profile</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Profile Deletion Confirmation Modal */}
      <Modal
        isOpen={!!profileToDelete}
        onClose={() => setProfileToDelete(null)}
        title="Delete Profile?"
        description={`Permanently remove profile "${profileToDelete?.name}".`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All timetable, attendance, expenses, and skills data isolated under &quot;{profileToDelete?.name}&quot; will be permanently deleted from this device.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setProfileToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>

      <CreateProfileModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </>
  );
}
