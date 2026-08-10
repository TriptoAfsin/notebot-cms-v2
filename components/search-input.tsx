"use client";

import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  pending = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /**
   * Typed text has not been applied yet — every table debounces by 300ms, so results lag the
   * keystrokes. Without this the pause reads as "no matches" rather than "still filtering".
   */
  pending?: boolean;
}) {
  return (
    <div className="relative w-full max-w-sm">
      {pending ? (
        <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
      ) : (
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      )}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon-xs"
          className="absolute right-1.5 top-1/2 -translate-y-1/2"
          onClick={() => onChange("")}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
