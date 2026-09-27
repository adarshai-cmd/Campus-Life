'use client';

import React, { useState, useId } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { CaptchaModal } from './CaptchaModal';
import { CampusLifeLogo } from '@/components/brand/CampusLifeLogo';
import { GraduationCap, Wallet, Plane, Lightbulb, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export function WelcomeScreen() {
  const { createProfile, isUsernameAvailable } = useProfile();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [userHasEditedUsername, setUserHasEditedUsername] = useState(false);
  const [residence, setResidence] = useState('');
  const [isCaptchaOpen, setIsCaptchaOpen] = useState(false);

  const [nameError, setNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [formError, setFormError] = useState('');

  const usernameId = useId();

  // Helper to slugify display name into a clean username recommendation
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

    // Auto-suggest username if user hasn't typed custom username yet
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

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = name.trim();
    const trimmedUsername = username.trim().toLowerCase();

    if (!trimmedName) {
      setNameError('Please enter your name.');
      return;
    }

    if (!trimmedUsername) {
      setUsernameError('Please enter a username.');
      return;
    }

    if (trimmedUsername.length < 3) {
      setUsernameError('Username must be at least 3 characters.');
      return;
    }

    // Step 3 & 4: Check username availability
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

    // Step 6, 7, 8, 9: Create profile, generate profileId, save locally, open dashboard
    const result = createProfile({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      residenceLabel: residence.trim() || 'Hostel / Campus',
    });

    if (!result.success) {
      setFormError(result.error || 'Failed to create profile.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 campus-canvas">
      <div className="w-full max-w-md">
        {/* Top Custom Brand Mark */}
        <div className="flex flex-col items-center text-center mb-8">
          <CampusLifeLogo size="xl" className="mb-4" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#0D5C46] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/80 mb-2">
            Campus Life · Production OS
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome to Campus Life
          </h1>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 max-w-sm leading-relaxed">
            Your personal student productivity hub for college timetable, attendance, money, trips, and skills.
          </p>
        </div>

        {/* Setup Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-sm">
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-xs font-semibold text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleContinue} className="space-y-4">
            {/* Step 1: Display Name */}
            <Input
              label="1. Display Name"
              id="student-name"
              placeholder="e.g. Adarsh Pandey or Priya Sharma"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              error={nameError}
              autoFocus
              autoComplete="name"
              helperText="How your name appears on your campus dashboard."
            />

            {/* Step 2: Unique Username */}
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={usernameId}
                  className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide uppercase"
                >
                  2. Choose Unique Username
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
                  placeholder="e.g. adarsh01"
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
                  Unique identity for this profile. Letters, numbers, and underscores only.
                </span>
              )}
            </div>

            {/* Optional Campus / Residence */}
            <Input
              label="Campus or Hostel (Optional)"
              id="student-residence"
              placeholder="e.g. Hostel Block B, Room 304"
              value={residence}
              onChange={(e) => setResidence(e.target.value)}
              helperText="Shown on your student dashboard header."
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!name.trim() || !username.trim()}
              >
                Continue to Verification →
              </Button>
            </div>
          </form>

          {/* Feature Highlights Grid */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold block mb-3">
              Included in your Campus workspace
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                <GraduationCap className="w-3.5 h-3.5 text-[#0D5C46] dark:text-emerald-400 shrink-0" />
                <span>College & Attendance</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                <Wallet className="w-3.5 h-3.5 text-[#0D5C46] dark:text-emerald-400 shrink-0" />
                <span>Hostel Budget & Money</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                <Plane className="w-3.5 h-3.5 text-[#0D5C46] dark:text-emerald-400 shrink-0" />
                <span>Travel & Home Trips</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                <Lightbulb className="w-3.5 h-3.5 text-[#0D5C46] dark:text-emerald-400 shrink-0" />
                <span>Skills & Milestones</span>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0D5C46] dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Local-first:</strong> Your data stays right on this device. No cloud transmission, no external trackers.
            </span>
          </div>
        </div>
      </div>

      <CaptchaModal
        isOpen={isCaptchaOpen}
        onClose={() => setIsCaptchaOpen(false)}
        onVerified={handleVerified}
        userName={name}
      />
    </div>
  );
}
