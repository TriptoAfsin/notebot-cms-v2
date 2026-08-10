"use client";

import { useState, useMemo, useRef, useEffect, useId } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
};

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  name,
  disabled = false,
  invalid = false,
  emptyMessage = "No results found",
  loading = false,
}: {
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  name?: string;
  /** cascading pickers need to lock a step until its parent is chosen */
  disabled?: boolean;
  /** mirrors the error ring the plain inputs get, so a missed pick is visible */
  invalid?: boolean;
  emptyMessage?: string;
  /**
   * Options are still being fetched. Without this an in-flight picker is indistinguishable from
   * an empty one, so a cascading step reads as "this subject has no topics" for as long as the
   * request takes.
   */
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // A skeleton in place of the whole control, rather than a spinner beside a clickable-looking
  // trigger: an empty picker that responds to clicks is worse than one that visibly isn't ready.
  if (loading) {
    return (
      <div className="relative" aria-busy="true" aria-live="polite">
        {name && <input type="hidden" name={name} value={value} />}
        <div className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3.5 w-3.5 rounded-sm" />
        </div>
        <span className="sr-only">Loading options…</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        disabled={disabled}
        // This is a combobox, not a plain button: aria-invalid/aria-expanded/aria-controls are
        // only meaningful under that role, and the implicit button role does not support them.
        // Renaming the attribute to data-* would have silenced the lint rule while leaving
        // screen-reader users with no signal that the field is in error.
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-invalid={invalid || undefined}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          invalid && "border-destructive ring-1 ring-destructive/30",
          !value && "text-muted-foreground"
        )}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <div className="flex items-center gap-1">
          {value && !disabled && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onValueChange("");
              }}
              className="hover:text-foreground text-muted-foreground"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div id={listboxId} role="listbox" className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            )}
            {filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                  setSearch("");
                }}
                className={cn(
                  "w-full text-left rounded-sm px-2 py-1.5 text-sm cursor-pointer",
                  "hover:bg-accent hover:text-accent-foreground",
                  value === option.value && "bg-primary/10 text-primary font-medium"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
