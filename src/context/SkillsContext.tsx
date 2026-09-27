'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Skill, SkillMilestone, SkillsSummary } from '@/types/skills';
import { storageService } from '@/services/storage/storageService';
import { useProfile } from './ProfileContext';

interface SkillsContextType {
  skills: Skill[];
  summary: SkillsSummary;
  addSkill: (data: Omit<Skill, 'id' | 'createdAt' | 'lastUpdated'>) => Skill;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  toggleMilestone: (skillId: string, milestoneId: string) => void;
  addMilestone: (skillId: string, title: string) => void;
  deleteMilestone: (skillId: string, milestoneId: string) => void;
  updateProgress: (skillId: string, progress: number) => void;
}

const SkillsContext = createContext<SkillsContextType | undefined>(undefined);

const STORAGE_KEY_SKILLS = 'skills_v3';

export function SkillsProvider({ children }: { children: React.ReactNode }) {
  const { activeProfile } = useProfile();
  const profileId = activeProfile?.id;

  const [skills, setSkills] = useState<Skill[]>(() => {
    if (!profileId) return [];
    return storageService.getItem<Skill[]>(profileId, STORAGE_KEY_SKILLS) || [];
  });

  const addSkill = useCallback(
    (data: Omit<Skill, 'id' | 'createdAt' | 'lastUpdated'>): Skill => {
      const nowIso = new Date().toISOString();
      const newSkill: Skill = {
        ...data,
        id: `skill_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: nowIso,
        lastUpdated: nowIso,
      };

      setSkills((prev) => {
        const next = [newSkill, ...prev];
        if (profileId) {
          storageService.setItem(profileId, STORAGE_KEY_SKILLS, next);
        }
        return next;
      });

      return newSkill;
    },
    [profileId]
  );

  const updateSkill = useCallback(
    (id: string, updates: Partial<Skill>) => {
      const nowIso = new Date().toISOString();
      setSkills((prev) => {
        const next = prev.map((s) =>
          s.id === id ? { ...s, ...updates, lastUpdated: nowIso } : s
        );
        if (profileId) {
          storageService.setItem(profileId, STORAGE_KEY_SKILLS, next);
        }
        return next;
      });
    },
    [profileId]
  );

  const deleteSkill = useCallback(
    (id: string) => {
      setSkills((prev) => {
        const next = prev.filter((s) => s.id !== id);
        if (profileId) {
          storageService.setItem(profileId, STORAGE_KEY_SKILLS, next);
        }
        return next;
      });
    },
    [profileId]
  );

  const toggleMilestone = useCallback(
    (skillId: string, milestoneId: string) => {
      const nowIso = new Date().toISOString();
      setSkills((prev) => {
        const next = prev.map((s) => {
          if (s.id !== skillId) return s;

          const updatedMilestones = s.milestones.map((m) => {
            if (m.id !== milestoneId) return m;
            const nextCompleted = !m.completed;
            return {
              ...m,
              completed: nextCompleted,
              completedAt: nextCompleted ? nowIso : undefined,
            };
          });

          // Automatically sync progress % with milestone completion if milestones exist
          let computedProgress = s.progress;
          if (updatedMilestones.length > 0) {
            const completedCount = updatedMilestones.filter((m) => m.completed).length;
            computedProgress = Math.round((completedCount / updatedMilestones.length) * 100);
          }

          return {
            ...s,
            milestones: updatedMilestones,
            progress: computedProgress,
            lastUpdated: nowIso,
          };
        });

        if (profileId) {
          storageService.setItem(profileId, STORAGE_KEY_SKILLS, next);
        }
        return next;
      });
    },
    [profileId]
  );

  const addMilestone = useCallback(
    (skillId: string, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const nowIso = new Date().toISOString();

      const newMilestone: SkillMilestone = {
        id: `ms_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: trimmed,
        completed: false,
      };

      setSkills((prev) => {
        const next = prev.map((s) => {
          if (s.id !== skillId) return s;
          const updatedMilestones = [...s.milestones, newMilestone];
          const completedCount = updatedMilestones.filter((m) => m.completed).length;
          const computedProgress = Math.round(
            (completedCount / updatedMilestones.length) * 100
          );

          return {
            ...s,
            milestones: updatedMilestones,
            progress: computedProgress,
            lastUpdated: nowIso,
          };
        });

        if (profileId) {
          storageService.setItem(profileId, STORAGE_KEY_SKILLS, next);
        }
        return next;
      });
    },
    [profileId]
  );

  const deleteMilestone = useCallback(
    (skillId: string, milestoneId: string) => {
      const nowIso = new Date().toISOString();
      setSkills((prev) => {
        const next = prev.map((s) => {
          if (s.id !== skillId) return s;
          const updatedMilestones = s.milestones.filter((m) => m.id !== milestoneId);
          let computedProgress = s.progress;
          if (updatedMilestones.length > 0) {
            const completedCount = updatedMilestones.filter((m) => m.completed).length;
            computedProgress = Math.round(
              (completedCount / updatedMilestones.length) * 100
            );
          }

          return {
            ...s,
            milestones: updatedMilestones,
            progress: computedProgress,
            lastUpdated: nowIso,
          };
        });

        if (profileId) {
          storageService.setItem(profileId, STORAGE_KEY_SKILLS, next);
        }
        return next;
      });
    },
    [profileId]
  );

  const updateProgress = useCallback(
    (skillId: string, progress: number) => {
      const valid = Math.min(100, Math.max(0, Math.round(progress)));
      const nowIso = new Date().toISOString();
      setSkills((prev) => {
        const next = prev.map((s) =>
          s.id === skillId ? { ...s, progress: valid, lastUpdated: nowIso } : s
        );
        if (profileId) {
          storageService.setItem(profileId, STORAGE_KEY_SKILLS, next);
        }
        return next;
      });
    },
    [profileId]
  );

  // Computations
  const summary: SkillsSummary = useMemo(() => {
    const totalSkills = skills.length;
    let completedMilestonesCount = 0;
    let totalMilestonesCount = 0;
    let totalProgressSum = 0;
    let inProgressCount = 0;

    for (const skill of skills) {
      totalProgressSum += Number(skill.progress) || 0;
      if (skill.progress > 0 && skill.progress < 100) {
        inProgressCount++;
      } else if (skill.progress === 0) {
        inProgressCount++;
      }
      for (const m of skill.milestones) {
        totalMilestonesCount++;
        if (m.completed) completedMilestonesCount++;
      }
    }

    const averageProgress = totalSkills > 0 ? Math.round(totalProgressSum / totalSkills) : 0;

    // Current focus skill: most recently updated skill that is not 100% finished
    const sorted = [...skills].sort((a, b) => (b.lastUpdated || '').localeCompare(a.lastUpdated || ''));
    const currentFocusSkill = sorted.find((s) => s.progress < 100) || sorted[0] || null;

    return {
      totalSkills,
      inProgressCount,
      completedMilestonesCount,
      totalMilestonesCount,
      averageProgress,
      currentFocusSkill,
    };
  }, [skills]);

  return (
    <SkillsContext.Provider
      value={{
        skills,
        summary,
        addSkill,
        updateSkill,
        deleteSkill,
        toggleMilestone,
        addMilestone,
        deleteMilestone,
        updateProgress,
      }}
    >
      {children}
    </SkillsContext.Provider>
  );
}

export function useSkills() {
  const context = useContext(SkillsContext);
  if (!context) {
    throw new Error('useSkills must be used within a SkillsProvider');
  }
  return context;
}
