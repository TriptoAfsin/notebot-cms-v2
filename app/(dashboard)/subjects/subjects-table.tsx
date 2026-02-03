"use client";

import { useState, useMemo } from "react";
import { Link } from "next-view-transitions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil } from "lucide-react";
import { DeleteSubjectButton } from "./delete-button";
import { SearchInput } from "@/components/search-input";

type Subject = {
  id: number;
  levelId: number;
  levelName: string;
  name: string;
  displayName: string;
  slug: string;
  sortOrder: number;
  metadata: unknown;
};

type Level = {
  id: number;
  displayName: string;
};

export function SubjectsTable({
  subjects,
  levels,
  currentLevelId,
}: {
  subjects: Subject[];
  levels: Level[];
  currentLevelId?: number;
}) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!search.trim()) return subjects;
    const q = search.toLowerCase();
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.displayName.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.levelName.toLowerCase().includes(q)
    );
  }, [subjects, search]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Subjects</h1>
        <Link href="/subjects/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search subjects..."
        />
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm cursor-pointer"
          value={currentLevelId ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            router.push(val ? `/subjects?levelId=${val}` : "/subjects");
          }}
        >
          <option value="">All Levels</option>
          {levels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.displayName}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead className="w-28">Level</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead className="w-32">Slug</TableHead>
              <TableHead className="w-20">Order</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell className="font-mono text-xs">{subject.id}</TableCell>
                <TableCell className="text-sm">{subject.levelName}</TableCell>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell>{subject.displayName}</TableCell>
                <TableCell className="font-mono text-xs">{subject.slug}</TableCell>
                <TableCell>{subject.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/subjects/${subject.id}`}>
                      <Button variant="outline" size="icon-xs">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <DeleteSubjectButton id={subject.id} levelId={subject.levelId} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {search ? "No subjects match your search" : "No subjects found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {filtered.length} of {subjects.length} subjects
      </p>
    </div>
  );
}
