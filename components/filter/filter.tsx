"use client";

import type { ReactNode } from "react";
import { Filter, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/button";
import { SelectInput, TextInput, fieldDescribedBy } from "@/components/form";

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
    <div className="mb-5 flex w-full min-w-0 flex-wrap items-end gap-3 rounded-[10px] border border-border/80 bg-surface px-4 py-3 shadow-card">
      <div className="hidden items-center gap-2 self-center border-r border-line pr-3 text-xs font-bold text-ink sm:flex">
        <Filter aria-hidden="true" className="size-4 text-ink-soft" />
        <span>Filter</span>
      </div>
      {fields.map((field) => {
        const value = values[field.key] ?? "";
        const inputId = `filter-${field.key}`;

        if (field.kind === "search") {
          return (
            <div
              key={field.key}
              className="flex w-full min-w-0 flex-col sm:w-auto sm:min-w-[14rem] sm:flex-1"
            >
              <label htmlFor={inputId} className="ui-label">
                {field.label}
              </label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                />
                <TextInput
                  id={inputId}
                  type="search"
                  value={value}
                  placeholder={field.placeholder}
                  aria-describedby={fieldDescribedBy(inputId)}
                  onChange={(event) => handleChange(field.key, event.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          );
        }

        if (field.kind === "select") {
          return (
            <div
              key={field.key}
              className="flex w-full min-w-0 flex-col sm:w-auto sm:min-w-[10rem]"
            >
              <label htmlFor={inputId} className="ui-label">
                {field.label}
              </label>
              <SelectInput
                id={inputId}
                value={value}
                onChange={(event) => handleChange(field.key, event.target.value)}
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </div>
          );
        }

        if (field.kind === "date") {
          return (
            <div
              key={field.key}
              className="flex w-full min-w-0 flex-col sm:w-auto sm:min-w-[9.5rem]"
            >
              <label htmlFor={inputId} className="ui-label">
                {field.label}
              </label>
              <TextInput
                id={inputId}
                type="date"
                value={value}
                onChange={(event) => handleChange(field.key, event.target.value)}
              />
            </div>
          );
        }

        return (
          <div key={field.key} className="flex w-full min-w-0 flex-col">
            <span className="ui-label">{field.label}</span>
            {field.render()}
          </div>
        );
      })}

      <Button
        variant="ghost"
        onClick={onReset}
        disabled={!hasActiveFilter}
        icon={<RotateCcw className="size-3.5" />}
        className="w-full text-[#ea0234] hover:bg-danger-soft hover:text-[#ea0234] sm:w-auto"
      >
        Reset Filter
      </Button>
    </div>
  );
}
