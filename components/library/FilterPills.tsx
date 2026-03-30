"use client";

import { FILTERS } from "@/lib/constants";

interface FilterPillsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function FilterPills({ activeFilter, onFilterChange }: FilterPillsProps) {
  return (
    <div className="flex gap-2 flex-nowrap overflow-x-auto md:flex-wrap pb-2 md:pb-0 -mx-1 px-1" style={{ WebkitOverflowScrolling: "touch" }}>
      {FILTERS.map((f) => (
        <button
          key={f}
          data-hover
          className={`filter-pill shrink-0 px-4 py-1.5 rounded-full border-none text-[13px] font-sans cursor-none whitespace-nowrap ${
            activeFilter === f
              ? "bg-accent text-primary font-medium"
              : "bg-pill-inactive-bg text-pill-inactive-text font-normal"
          }`}
          onClick={() => onFilterChange(f)}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
