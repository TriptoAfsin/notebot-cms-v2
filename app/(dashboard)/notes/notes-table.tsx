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
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { DeleteNoteButton } from "./delete-button";
import { SearchInput } from "@/components/search-input";

type Note = {
  id: number;
  topicId: number;
  topicName: string;
  title: string;
  url: string;
  sortOrder: number;
  metadata: unknown;
};

type Topic = {
  id: number;
  displayName: string;
};

export function NotesTable({
  notes,
  topics,
  currentTopicId,
}: {
  notes: Note[];
  topics: Topic[];
  currentTopicId?: number;
}) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!search.trim()) return notes;
    const q = search.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.topicName.toLowerCase().includes(q) ||
        n.url.toLowerCase().includes(q)
    );
  }, [notes, search]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Notes</h1>
        <Link href="/notes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search notes..."
        />
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm cursor-pointer"
          value={currentTopicId ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            router.push(val ? `/notes?topicId=${val}` : "/notes");
          }}
        >
          <option value="">All Topics</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.displayName}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead className="w-36">Topic</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-64">URL</TableHead>
              <TableHead className="w-20">Order</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((note) => (
              <TableRow key={note.id}>
                <TableCell className="font-mono text-xs">{note.id}</TableCell>
                <TableCell className="text-sm">{note.topicName}</TableCell>
                <TableCell className="font-medium">{note.title}</TableCell>
                <TableCell>
                  <a
                    href={note.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline text-sm truncate max-w-[240px]"
                  >
                    {note.url.replace(/^https?:\/\//, "").slice(0, 40)}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </TableCell>
                <TableCell>{note.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/notes/${note.id}`}>
                      <Button variant="outline" size="icon-xs">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <DeleteNoteButton id={note.id} topicId={note.topicId} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {search ? "No notes match your search" : "No notes found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {filtered.length} of {notes.length} notes
      </p>
    </div>
  );
}
