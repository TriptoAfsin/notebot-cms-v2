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
import { DeleteTopicButton } from "./delete-button";
import { SearchInput } from "@/components/search-input";

type Topic = {
  id: number;
  subjectId: number;
  subjectName: string;
  name: string;
  displayName: string;
  slug: string;
  sortOrder: number;
  metadata: unknown;
};

type Subject = {
  id: number;
  displayName: string;
};

export function TopicsTable({
  topics,
  subjects,
  currentSubjectId,
}: {
  topics: Topic[];
  subjects: Subject[];
  currentSubjectId?: number;
}) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!search.trim()) return topics;
    const q = search.toLowerCase();
    return topics.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.displayName.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.subjectName.toLowerCase().includes(q)
    );
  }, [topics, search]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Topics</h1>
        <Link href="/topics/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Topic
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search topics..."
        />
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm cursor-pointer"
          value={currentSubjectId ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            router.push(val ? `/topics?subjectId=${val}` : "/topics");
          }}
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.displayName}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead className="w-32">Subject</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead className="w-32">Slug</TableHead>
              <TableHead className="w-20">Order</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((topic) => (
              <TableRow key={topic.id}>
                <TableCell className="font-mono text-xs">{topic.id}</TableCell>
                <TableCell className="text-sm">{topic.subjectName}</TableCell>
                <TableCell className="font-medium">{topic.name}</TableCell>
                <TableCell>{topic.displayName}</TableCell>
                <TableCell className="font-mono text-xs">{topic.slug}</TableCell>
                <TableCell>{topic.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/topics/${topic.id}`}>
                      <Button variant="outline" size="icon-xs">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <DeleteTopicButton id={topic.id} subjectId={topic.subjectId} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {search ? "No topics match your search" : "No topics found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {filtered.length} of {topics.length} topics
      </p>
    </div>
  );
}
