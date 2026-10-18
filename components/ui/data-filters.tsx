"use client";

import type { ReactNode } from "react";

export type FilterOption = {
  label: string;
  value: string;
};

export type FilterField =
  | { key: string; kind: "search"; label: string; placeholder: string }
  | { key: string; kind: "select"; label: string; options: FilterOption[] }
  | { key: string; kind: "date"; label: string }
  | { key: string; kind: "custom"; label: string; render: () => ReactNode };

export type FilterValues = Record<string, string>;

type DataFiltersProps = {
  fields: FilterField[];
  values: FilterValues;
  onFilterChange: (values: FilterValues) => void;
  onReset: () => void;
};

const isActiveValue = (value: string | undefined): boolean =>
  value !== undefined && value !== "" && value !== "all";

export function DataFilters({
  fields,
  values,
  onFilterChange,
  onReset,
}: DataFiltersProps) {
  const hasActiveFilter = fields.some((field) => isActiveValue(values[field.key]));

  const handleChange = (key: string, value: string) => {
    onFilterChange({ ...values, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white p-4">
      {fields.map((field) => {
        const value = values[field.key] ?? "";

        if (field.kind === "search") {
          return (
            <div key={field.key} className="flex min-w-[14rem] flex-1 flex-col gap-1">
              <label
                htmlFor={`filter-${field.key}`}
                className="text-xs font-medium text-zinc-600"
              >
                {field.label}
              </label>
              <input
                id={`filter-${field.key}`}
                type="search"
                value={value}
                placeholder={field.placeholder}
                onChange={(event) => handleChange(field.key, event.target.value)}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
              />
            </div>
          );
        }

        if (field.kind === "select") {
          return (
            <div key={field.key} className="flex min-w-[10rem] flex-col gap-1">
              <label
                htmlFor={`filter-${field.key}`}
                className="text-xs font-medium text-zinc-600"
              >
                {field.label}
              </label>
              <select
                id={`filter-${field.key}`}
                value={value}
                onChange={(event) => handleChange(field.key, event.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        if (field.kind === "date") {
          return (
            <div key={field.key} className="flex min-w-[9.5rem] flex-col gap-1">
              <label
                htmlFor={`filter-${field.key}`}
                className="text-xs font-medium text-zinc-600"
              >
                {field.label}
              </label>
              <input
                id={`filter-${field.key}`}
                type="date"
                value={value}
                onChange={(event) => handleChange(field.key, event.target.value)}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
              />
            </div>
          );
        }

        return (
          <div key={field.key} className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-600">{field.label}</span>
            {field.render()}
          </div>
        );
      })}

      <button
        type="button"
        onClick={onReset}
        disabled={!hasActiveFilter}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-40"
      >
        Reset
      </button>
    </div>
  );
}