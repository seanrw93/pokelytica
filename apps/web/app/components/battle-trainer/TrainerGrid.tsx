"use client";

import { useMemo, useState } from "react";
import { PiMagnifyingGlass, PiUsersThree } from "react-icons/pi";
import { getTrainerRole, ROLES } from "../../utils/trainerRole";
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

const selectClasses =
  "p-2 rounded-md bg-surface-raised border border-border text-foreground text-sm focus:outline-none focus:border-accent transition-colors duration-150";

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
      const matchesRole = roleFilter === "all" || getTrainerRole(trainer.title) === roleFilter;

      return matchesSearch && matchesGeneration && matchesRole;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "generation") return a.generation - b.generation || a.name.localeCompare(b.name);
      if (sortBy === "role")
        return getTrainerRole(a.title).localeCompare(getTrainerRole(b.title)) || a.name.localeCompare(b.name);
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Battle a trainer</h1>
        <p className="text-muted-light max-w-[65ch]">
          Pick an opponent. Their team loads straight into the builder so you only need to build your own.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trainers..."
            className="w-full pl-9 pr-3 py-2 rounded-md bg-surface-raised border border-border text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors duration-150"
          />
        </div>

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
          <button onClick={clearFilters} className="text-sm text-accent hover:underline cursor-pointer">
            Clear filters
          </button>
        )}
      </div>

      <div className="text-xs font-mono uppercase tracking-wide text-muted">
        {visibleTrainers.length} of {trainers.length} trainers
      </div>

      {visibleTrainers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center border border-dashed border-border rounded-lg">
          <PiUsersThree className="w-8 h-8 text-muted" />
          <p className="text-muted-light">No trainers match your search or filters.</p>
          <button onClick={clearFilters} className="text-sm text-accent hover:underline cursor-pointer">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {visibleTrainers.map((trainer) => (
            <TrainerCard
              key={trainer.id}
              name={trainer.name}
              title={trainer.title}
              spriteId={trainer.spriteId}
              generation={trainer.generation}
            />
          ))}
        </div>
      )}
    </div>
  );
};
