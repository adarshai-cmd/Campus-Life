'use client';

import React, { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { useTheme } from '@/context/ThemeContext';
import { SUPPORTED_CURRENCIES, CurrencyCode, ThemeMode, UserProfile } from '@/types/profile';
import { ImportValidationResult } from '@/types/storage';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { ProfileSwitcherModal } from '@/components/profile/ProfileSwitcherModal';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { IosInstallGuideModal } from '@/components/pwa/IosInstallGuideModal';
import {
  User,
  Settings as SettingsIcon,
  Coins,
  Sun,
  Moon,
  Laptop,
  Users,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  Smartphone,
  RefreshCw,
  Info,
} from 'lucide-react';

function ProfileEditForm({
  profile,
  onSave,
}: {
  profile: UserProfile | null;
  onSave: (updates: Partial<UserProfile>) => void;
}) {
  const { isUsernameAvailable } = useProfile();
  const [name, setName] = useState(profile?.name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [residence, setResidence] = useState(profile?.residenceLabel || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const cleanUsername = username.trim().toLowerCase();
  const currentUsername = (profile?.username || '').toLowerCase();
  const isUsernameChanged = cleanUsername !== currentUsername;

  let usernameError = '';
  let usernameAvailable = false;

  if (!cleanUsername) {
    usernameError = 'Username is required.';
  } else if (!/^[a-z0-9_]{3,24}$/.test(cleanUsername)) {
    usernameError = 'Use 3-24 lowercase letters, numbers, or underscores.';
  } else if (isUsernameChanged) {
    const available = isUsernameAvailable(cleanUsername, profile?.id);
    if (!available) {
      usernameError = 'This username already exists. Please choose another username.';
    } else {
      usernameAvailable = true;
    }
  }

  const isFormValid =
    name.trim().length > 0 &&
    cleanUsername.length >= 3 &&
    !usernameError;

  const isUnchanged =
    name === (profile?.name || '') &&
    cleanUsername === currentUsername &&
    residence === (profile?.residenceLabel || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    if (!isFormValid || isUnchanged) return;

    try {
      onSave({
        name: name.trim(),
        username: cleanUsername,
        residenceLabel: residence.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      setSaveError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <Input
        label="Display Name"
        id="profile-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Adarsh Pandey"
        required
      />

      <div>
        <Input
          label="Unique Username"
          id="profile-username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
            setSaveError(null);
          }}
          placeholder="e.g. adarsh01"
          required
          helperText={
            usernameError
              ? undefined
              : 'Unique identifier used for profile selection and multi-profile isolation.'
          }
        />
        {usernameError && (
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {usernameError}
          </p>
        )}
        {usernameAvailable && isUsernameChanged && (
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            Username is available
          </p>
        )}
      </div>

      <Input
        label="Campus or Residence Label"
        id="profile-residence"
        value={residence}
        onChange={(e) => setResidence(e.target.value)}
        placeholder="e.g. Hostel Block B, Room 304"
        helperText="Appears on dashboard header and transit leaves."
      />

      {saveError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!isFormValid || isUnchanged}
        >
          Save Profile Changes
        </Button>
        {saveSuccess && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Saved locally
          </span>
        )}
      </div>
    </form>
  );
}

export default function SettingsPage() {
  const {
    activeProfile,
    profiles,
    updateActiveProfile,
    deleteProfile,
    resetAllData,
    exportCurrentProfileData,
    validateImportContent,
    importProfileBackup,
  } = useProfile();
  const { theme, setTheme } = useTheme();
  const {
    isMounted,
    isInstalled,
    isGuideOpen,
    setIsGuideOpen,
    install,
    clearAppCacheOnly,
  } = usePwaInstall();

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [cacheClearStatus, setCacheClearStatus] = useState<string | null>(null);

  // Import flow state
  const [pendingImport, setPendingImport] = useState<ImportValidationResult | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleClearCache = async () => {
    const ok = await clearAppCacheOnly();
    if (ok) {
      setCacheClearStatus('Application static cache cleared successfully. User profile data is 100% untouched.');
      setTimeout(() => setCacheClearStatus(null), 4500);
    } else {
      setCacheClearStatus('No service worker cache found to clear.');
      setTimeout(() => setCacheClearStatus(null), 3000);
    }
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    updateActiveProfile({ theme: newTheme });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = validateImportContent(content);

      if (!validation.isValid) {
        setImportStatus({
          type: 'error',
          message: validation.error || 'Invalid backup file format.',
        });
        setTimeout(() => setImportStatus(null), 5000);
      } else {
        setPendingImport(validation);
        setIsImportModalOpen(true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (!pendingImport || !pendingImport.parsedData) return;

    const result = importProfileBackup(pendingImport.parsedData);
    setIsImportModalOpen(false);

    if (result.success) {
      setImportStatus({
        type: 'success',
        message: `Successfully restored profile "${pendingImport.profileName}" and all associated data!`,
      });
    } else {
      setImportStatus({
        type: 'error',
        message: result.error || 'Failed to restore profile data.',
      });
    }

    setPendingImport(null);
    setTimeout(() => setImportStatus(null), 6000);
  };

  const handleDeleteCurrent = () => {
    if (!activeProfile) return;
    deleteProfile(activeProfile.id);
    setIsDeleteModalOpen(false);
  };

  const handleResetEverything = () => {
    resetAllData();
    setIsResetModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Settings Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="accent" size="sm">
            <SettingsIcon className="w-3 h-3 mr-1" />
            Preferences & Storage
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your active profile, currency preferences, appearance, and local storage data.
        </p>
      </div>

      {/* Security & Privacy Notice Card (Mandatory Requirement) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-[#0D5C46] dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Privacy & Local-First Storage
          </h2>
          <p className="text-slate-700 dark:text-slate-300 font-medium">
            Your data is stored locally on this device.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Campus Life does not send your personal logs, expenses, or coursework to any external servers or third-party trackers.
          </p>
          <p className="text-amber-800 dark:text-amber-300/90 font-medium pt-0.5">
            Clearing browser/site data may remove your local data. Export your data regularly for backup.
          </p>
        </div>
      </div>

      {/* Section 1: Active Profile Details */}
      <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#0D5C46] dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/60">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Profile Information
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Personalized details for your campus OS
            </span>
          </div>
        </div>

        <ProfileEditForm
          key={activeProfile?.id || 'empty'}
          profile={activeProfile}
          onSave={updateActiveProfile}
        />
      </section>

      {/* Section 2: Currency Preference */}
      <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/60">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Default Currency
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Applied across allowance, mess bills, and expense tracking
            </span>
          </div>
        </div>

        <div className="max-w-xs space-y-1.5">
          <label
            htmlFor="currency-select"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide block"
          >
            Currency
          </label>
          <select
            id="currency-select"
            value={activeProfile?.currency || 'INR'}
            onChange={(e) => {
              const val = e.target.value as CurrencyCode;
              updateActiveProfile({ currency: val });
            }}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all outline-none bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border border-slate-300/80 dark:border-slate-700 focus:border-[#0D5C46] dark:focus:border-emerald-500"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-500 dark:text-slate-400 block pt-1">
            Default: <strong>₹ INR (Indian Rupee)</strong>
          </span>
        </div>
      </section>

      {/* Section 3: Theme Appearance */}
      <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Theme & Appearance
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Glass Campus aesthetic tailored for academic reading and night study
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
              theme === 'light'
                ? 'bg-emerald-50/80 border-[#0D5C46]/50 dark:bg-emerald-950/40 dark:border-emerald-500 ring-1 ring-[#0D5C46]/20'
                : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-850'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                Light
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Warm paper & glass
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
              theme === 'dark'
                ? 'bg-emerald-50/80 border-[#0D5C46]/50 dark:bg-emerald-950/40 dark:border-emerald-500 ring-1 ring-[#0D5C46]/20'
                : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-850'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                Dark
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Calm nocturnal slate
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
              theme === 'system'
                ? 'bg-emerald-50/80 border-[#0D5C46]/50 dark:bg-emerald-950/40 dark:border-emerald-500 ring-1 ring-[#0D5C46]/20'
                : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-850'
            }`}
          >
            <Laptop className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                System
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Match OS schedule
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* Section 4: Multi-Profile Switcher */}
      <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-800/60">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Profiles Management
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {profiles.length} local {profiles.length === 1 ? 'profile' : 'profiles'} registered
              </span>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setIsSwitcherOpen(true)}>
            Switch / Add Profile
          </Button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          Campus Life keeps separate budgets, assignments, and travel logs for each profile. Data is strictly isolated.
        </p>
      </section>

      {/* Section 5: Data Backup & Portability */}
      <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center border border-teal-200/60 dark:border-teal-800/60">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Backup & Data Portability
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Export your profile JSON archive or restore an existing backup
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={exportCurrentProfileData}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Active Profile Data (.json)</span>
          </Button>

          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-150 px-4 py-2.5 text-sm font-medium min-h-[42px] bg-slate-100/90 text-slate-800 hover:bg-slate-200/90 border border-slate-200/80 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700/80 dark:border-slate-700/80">
              <Upload className="w-4 h-4" />
              <span>Import Data Backup</span>
            </span>
          </label>
        </div>

        {importStatus && (
          <div
            className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-medium ${
              importStatus.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
            }`}
          >
            {importStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}
      </section>

      {/* Section 6: Privacy Policy & Local-First Architecture (Requirement 9 & 11) */}
      <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#0D5C46] dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/60">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Privacy Policy & Local Data Guarantee
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Transparent local-first principles and device data boundaries
            </span>
          </div>
        </div>

        <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs block">
              1. 100% Local Storage on Your Device
            </span>
            <p>
              Your Campus Life profile, timetable, attendance logs, expenses, travel itineraries, and skills are stored locally on this device in your browser&apos;s storage engine. No accounts or records are transmitted to remote cloud databases.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs block">
              2. Zero External Tracking or Telemetry
            </span>
            <p>
              Campus Life does not employ third-party analytics trackers, advertising SDKs, behavioral fingerprinting, or external AI profiling APIs. Natural language expense classification runs 100% offline via local rule matchers.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs block">
              3. Profile Isolation & Transparency
            </span>
            <p>
              Your profile is stored locally on this device. Profile switching allows you to separate semester records or roommates on the same browser, but local storage does not constitute enterprise cryptographic sandboxing.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-amber-900 dark:text-amber-300/90 space-y-1">
            <span className="font-bold text-xs block">
              4. Data Retention & User Backup Responsibility
            </span>
            <p>
              Because data is kept exclusively in browser storage, clearing your browser history, resetting site data, or using aggressive private-browsing modes can delete your locally stored information. We strongly recommend using the <strong>Export Active Profile Data</strong> button above to download regular backups.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: Terms & Conditions (Requirement 10) */}
      <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Terms & Conditions
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Academic productivity tool usage guidelines and terms
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
            <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">
              Application Purpose
            </span>
            <p>
              Campus Life is a personal productivity assistant designed to help students organize academic timetables, track class attendance percentages, budget hostel living expenses, and manage travel itineraries.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
            <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">
              User Responsibility
            </span>
            <p>
              The user is solely responsible for verifying the accuracy of coursework deadlines, examination dates, financial calculations, and attendance figures against their institution&apos;s official academic records.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
            <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">
              Limitation of Liability
            </span>
            <p>
              Campus Life is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranty of any kind. The creators assume no liability for missed deadlines, institutional attendance penalties, data loss resulting from device failure, or browser cache resets.
            </p>
          </div>

          <p className="text-[11px] text-slate-400 italic pt-1">
            * This notice is provided for academic product transparency and does not constitute formal legal counsel.
          </p>
        </div>
      </section>

      {/* Section: App & PWA Installation (Requirement 28) */}
      <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#0D5C46] dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/60">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              App & Progressive Web App (PWA)
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Mobile standalone status, home screen installation, and offline runtime
            </span>
          </div>
        </div>

        {/* Installation Status card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Installation Status:
              </span>
              {isMounted && isInstalled ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Installed / Standalone App
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  Web Browser Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isMounted && isInstalled
                ? 'Campus Life is currently running in standalone fullscreen window mode with instant access.'
                : 'Install Campus Life on your device for one-tap home screen access and enhanced offline reliability.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            {isMounted && !isInstalled && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => install()}
                className="gap-1.5 w-full sm:w-auto text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>📲 Install Campus Life</span>
              </Button>
            )}

            {isMounted && isInstalled && (
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Ready & Offline-Safe
              </span>
            )}
          </div>
        </div>

        {/* Application Cache Management (Safely separated from User Data) */}
        <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                Application Static Assets Cache
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                Service worker caches HTML/CSS bundles. Clearing this re-downloads latest app code without modifying your database.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              className="gap-1.5 shrink-0 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear App Cache</span>
            </Button>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-300">
            <strong>Data Guarantee:</strong> Clearing the Application Cache will <strong>NOT</strong> delete your profile, timetable, expenses, trips, or skills data.
          </div>

          {cacheClearStatus && (
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{cacheClearStatus}</span>
            </div>
          )}
        </div>
      </section>

      {/* Section 8: Danger Zone */}
      <section className="glass-card rounded-2xl p-5 sm:p-6 border-rose-200/70 dark:border-rose-900/60 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-rose-100 dark:border-rose-900/40">
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center border border-rose-200/60 dark:border-rose-800/60">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
              Danger Zone
            </h2>
            <span className="text-xs text-rose-600/80 dark:text-rose-400">
              Irreversible local data deletion controls
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          <div>
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
              Delete Profile: {activeProfile?.name}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              Permanently clears this profile and all its scoped data from this device.
            </span>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={profiles.length <= 1}
            className="gap-1.5 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Profile</span>
          </Button>
        </div>

        {profiles.length <= 1 && (
          <span className="text-[11px] text-slate-400 block italic">
            You must have at least one profile. Create another profile before deleting this one.
          </span>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <div>
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
              Reset All Local Storage Data
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              Completely wipes all profiles, settings, and records from this browser.
            </span>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsResetModalOpen(true)}
            className="gap-1.5 shrink-0"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Reset Local Data</span>
          </Button>
        </div>
      </section>

      {/* Import Confirmation Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Confirm Backup Import"
        description="Verify backup records before restoring them into local storage."
        maxWidth="md"
      >
        {pendingImport && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Profile in Backup
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {pendingImport.profileName}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Backup Version</span>
                <span className="font-mono">{pendingImport.version}</span>
              </div>
              {pendingImport.exportedAt && (
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Exported At</span>
                  <span>{new Date(pendingImport.exportedAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Item Counts breakdown */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                Records Included
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-slate-500">Expenses:</span>
                  <span className="font-bold font-mono">{pendingImport.itemCounts?.expenses ?? 0}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-slate-500">Trips:</span>
                  <span className="font-bold font-mono">{pendingImport.itemCounts?.trips ?? 0}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-slate-500">Attendance:</span>
                  <span className="font-bold font-mono">{pendingImport.itemCounts?.attendance ?? 0}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-slate-500">Assignments:</span>
                  <span className="font-bold font-mono">{pendingImport.itemCounts?.assignments ?? 0}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-slate-500">Skills:</span>
                  <span className="font-bold font-mono">{pendingImport.itemCounts?.skills ?? 0}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-slate-500">Timetable:</span>
                  <span className="font-bold font-mono">{pendingImport.itemCounts?.timetable ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
              <strong>Notice:</strong> Restoring this backup will update the records for profile &quot;{pendingImport.profileName}&quot;. Existing entries for this profile ID will be merged with the backup.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setIsImportModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmImport} className="gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Confirm & Restore</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete this profile?"
        description={`This will permanently delete profile "${activeProfile?.name}".`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All stored settings, expenses, travel records, and course notes associated with this profile will be purged. This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteCurrent}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset All Local Data?"
        description="Complete factory reset for Campus Life on this device."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
            <strong>Warning:</strong> Every profile, memo, and saved preference will be wiped. You will return to the first-launch setup screen.
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleResetEverything}>
              Wipe All Data
            </Button>
          </div>
        </div>
      </Modal>

      <ProfileSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />

      <IosInstallGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
