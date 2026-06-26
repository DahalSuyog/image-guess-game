'use client';

import { CategoryInfo } from '@/data/repositories/types';

interface CategoryBarProps {
  categories: CategoryInfo[];
  active: string;
  onSelect: (key: string) => void;
}

export function CategoryBar({ categories, active, onSelect }: CategoryBarProps) {
  return (
    <div className="flex items-center justify-center gap-1 flex-wrap rounded-md bg-surface-container px-2 py-1.5">
      {categories.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`px-3 py-1 rounded font-label-sm text-label-sm lowercase transition-colors ${
            key === active
              ? 'text-on-primary bg-primary'
              : 'text-outline hover:text-on-surface-variant'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
