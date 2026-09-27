'use client';

import React, { useState, useMemo } from 'react';
import { Lightbulb, Plus, Search, Compass } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { useSkills } from '@/context/SkillsContext';
import { SkillCard } from '@/components/skills/SkillCard';
import { SkillModal } from '@/components/skills/SkillModal';
import { SkillsOverview } from '@/components/skills/SkillsOverview';
import { Skill, SKILL_CATEGORIES } from '@/types/skills';

export default function SkillsPage() {
  const { skills } = useSkills();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSkills = useMemo(() => {
    return skills.filter((s) => {
      const matchCat =
        selectedCategory === 'All' || s.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [skills, selectedCategory, searchQuery]);

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSkill(null);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="accent" size="sm">
              <Lightbulb className="w-3.5 h-3.5 mr-1" />
              Self-Study & Tech
            </Badge>
            <Badge variant="neutral" size="sm">
              Continuous Growth
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Skills & Growth
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track programming languages, frameworks, interview roadmaps, and custom milestones.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setEditingSkill(null);
            setIsModalOpen(true);
          }}
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Skill
        </Button>
      </div>

      {/* Top Metrics Cards */}
      <SkillsOverview />

      {/* Controls: Search & Category Filter */}
      {skills.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Categories pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All ({skills.length})
            </button>
            {SKILL_CATEGORIES.map((cat) => {
              const count = skills.filter((s) => s.category === cat).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none"
            />
          </div>
        </div>
      )}

      {/* Skills Grid */}
      {filteredSkills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} onEdit={handleEdit} />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="glass-card rounded-2xl p-6 sm:p-10">
          <EmptyState
            icon={Compass}
            title="No skills added yet"
            description="Start tracking languages like Python, C++, DSA roadmaps, SQL, or communication skills with custom milestones."
            actionLabel="+ Add Your First Skill"
            onAction={() => {
              setEditingSkill(null);
              setIsModalOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-8 text-center text-slate-500 text-sm">
          No skills match your filter or search query.
        </div>
      )}

      {/* Modal */}
      <SkillModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={editingSkill}
      />
    </div>
  );
}
