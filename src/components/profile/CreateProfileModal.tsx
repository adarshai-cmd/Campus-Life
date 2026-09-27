'use client';

import React, { useState, useId } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { CaptchaModal } from './CaptchaModal';
import { useProfile } from '@/context/ProfileContext';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProfileModal({ isOpen, onClose }: CreateProfileModalProps) {
  const { createProfile, isUsernameAvailable } = useProfile();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [userHasEditedUsername, setUserHasEditedUsername] = useState(false);
  const [residence, setResidence] = useState('');
  const [nameError, setNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [formError, setFormError] = useState('');
  const [isCaptchaOpen, setIsCaptchaOpen] = useState(false);

  const usernameId = useId();

  const suggestUsername = (fullName: string) => {
    return fullName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (nameError) setNameError('');
    if (formError) setFormError('');

    if (!userHasEditedUsername) {
      const suggested = suggestUsername(val);
      setUsername(suggested);
      if (suggested && !isUsernameAvailable(suggested)) {
        setUsername(`${suggested}${Math.floor(Math.random() * 89 + 10)}`);
      }
    }
  };

  const handleUsernameChange = (val: string) => {
    const sanitized = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(sanitized);
    setUserHasEditedUsername(true);
    if (usernameError) setUsernameError('');
    if (formError) setFormError('');
  };

  const isCurrentUsernameAvailable = username.trim().length >= 3 && isUsernameAvailable(username.trim());
  const isCurrentUsernameTaken = username.trim().length >= 3 && !isUsernameAvailable(username.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = name.trim();
    const trimmedUsername = username.trim().toLowerCase();

    if (!trimmedName) {
      setNameError('Please provide a profile name.');
      return;
    }
    if (!trimmedUsername) {
      setUsernameError('Please provide a username.');
      return;
    }
    if (trimmedUsername.length < 3) {
      setUsernameError('Username must be at least 3 characters.');
      return;
    }

    // Check username availability
    if (!isUsernameAvailable(trimmedUsername)) {
      setUsernameError('This username already exists. Please choose another username.');
      return;
    }

    setNameError('');
    setUsernameError('');
    setIsCaptchaOpen(true);
  };

  const handleVerified = () => {
    setIsCaptchaOpen(false);
    const result = createProfile({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      residenceLabel: residence.trim() || 'Hostel / Campus',
    });

    if (result.success) {
      setName('');
      setUsername('');
      setUserHasEditedUsername(false);
      setResidence('');
      onClose();
    } else {
      setFormError(result.error || 'Failed to create profile.');
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !isCaptchaOpen}
        onClose={onClose}
        title="Create New Profile"
        description="Add a separate local profile with its own isolated data."
        maxWidth="sm"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-xs font-semibold text-rose-800 dark:text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Display Name"
            placeholder="e.g. Rahul Sharma or Priya Verma"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            error={nameError}
            autoFocus
          />

          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between">
              <label
                htmlFor={usernameId}
                className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide uppercase"
              >
                Unique Username
              </label>
              {username.trim().length >= 3 && (
                <span
                  className={`text-[11px] font-semibold flex items-center gap-1 ${
                    isCurrentUsernameAvailable
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isCurrentUsernameAvailable ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Available
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      Unavailable
                    </>
                  )}
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold text-sm">
                @
              </span>
              <input
                id={usernameId}
                type="text"
                placeholder="e.g. rahul01"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 outline-none
                  bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono
                  border ${
                    usernameError || isCurrentUsernameTaken
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : isCurrentUsernameAvailable
                      ? 'border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-slate-300 dark:border-slate-700 focus:border-[#0D5C46] dark:focus:border-emerald-500'
                  }`}
                autoComplete="username"
              />
            </div>

            {usernameError ? (
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">{usernameError}</span>
            ) : (
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Unique identifier for this student profile.
              </span>
            )}
          </div>

          <Input
            label="Campus or Hostel Label (Optional)"
            placeholder="e.g. Room 102, PG, Day Scholar"
            value={residence}
            onChange={(e) => setResidence(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!name.trim() || !username.trim()}>
              Continue to Verify
            </Button>
          </div>
        </form>
      </Modal>

      <CaptchaModal
        isOpen={isCaptchaOpen}
        onClose={() => setIsCaptchaOpen(false)}
        onVerified={handleVerified}
        userName={name}
      />
    </>
  );
}
