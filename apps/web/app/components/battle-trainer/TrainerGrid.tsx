"use client";

import { useMemo, useState } from "react";
import { TrainerCard } from "./TrainerCard";

type Trainer = {
  id: string;
  name: string;
  title: string;
  generation: number;
  spriteId: string;
};

type TrainerGridProps = {
  trainers: Trainer[];
};

type SortBy = "name" | "generation" | "role";

const ROLES = ["Gym Leader", "Elite Four", "Champion", "Rival"] as const;
type Role = (typeof ROLES)[number];

const getRole = (title: string): Role => {
  if (title.includes("Gym Leader")) return "Gym Leader";
  if (title.includes("Elite Four")) return "Elite Four";
  if (title.includes("Champion")) return "Champion";
  return "Rival";
};

const selectClasses =
  "p-2 rounded bg-surface-raised border border-border text-foreground focus:outline-none focus:border-accent transition-colors duration-150";

export const TrainerGrid = ({ trainers }: TrainerGridProps) => {
  const [search, setSearch] = useState("");
  const [generationFilter, setGenerationFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortBy>("name");

  const generations = useMemo(
    () => [...new Set(trainers.map((t) => t.generation))].sort((a, b) => a - b),
    [trainers],
  );

  const visibleTrainers = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = trainers.filter((trainer) => {
      const matchesSearch =
        query === "" ||
        trainer.name.toLowerCase().includes(query) ||
        trainer.title.toLowerCase().includes(query);
      const matchesGeneration =
        generationFilter === "all" || trainer.generation === Number(generationFilter);
      const matchesRole = roleFilter === "all" || getRole(trainer.title) === roleFilter;

      return matchesSearch && matchesGeneration && matchesRole;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "generation") return a.generation - b.generation || a.name.localeCompare(b.name);
      if (sortBy === "role") return getRole(a.title).localeCompare(getRole(b.title)) || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
  }, [trainers, search, generationFilter, roleFilter, sortBy]);

  const hasActiveFilters = search !== "" || generationFilter !== "all" || roleFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setGenerationFilter("all");
    setRoleFilter("all");
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Battle a Trainer</h1>
      <p className="text-muted-light">
        Pick an opponent — their team loads straight into the builder so you only need to build your own.
      </p>

      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search trainers..."
          className="flex-1 min-w-[200px] p-2 rounded bg-surface-raised border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors duration-150"
        />

        <select
          value={generationFilter}
          onChange={(e) => setGenerationFilter(e.target.value)}
          className={selectClasses}
        >
          <option value="all">All generations</option>
          {generations.map((gen) => (
            <option key={gen} value={gen}>
              Generation {gen}
            </option>
          ))}
        </select>

        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={selectClasses}>
          <option value="all">All roles</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className={selectClasses}>
          <option value="name">Sort: Name</option>
          <option value="generation">Sort: Generation</option>
          <option value="role">Sort: Role</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-accent hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {visibleTrainers.length === 0 ? (
        <p className="text-muted-light">No trainers match your search/filters.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {visibleTrainers.map((trainer) => (
            <TrainerCard
              key={trainer.id}
              name={trainer.name}
              title={trainer.title}
              spriteId={trainer.spriteId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
