"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { Link } from "next-view-transitions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSubmissions } from "@/actions/note-submissions.action";
import { useQueryParam } from "@/hooks/use-query-param";
import { ExternalLink, Copy, Settings, Check } from "lucide-react";
import { SearchInput } from "@/components/search-input";
import { TablePagination } from "@/components/table-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

type Submission = {
  id: number;
  name: string;
  subjectName: string;
  topicName: string;
  batch: string;
  department: string;
  status: string;
  createdAt: Date;
};

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400">
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400">
          Pending
        </Badge>
      );
  }
}

const tabs = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Link copied!");
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
      {copied ? "Copied" : "Copy Link"}
    </Button>
  );
}

function SubmissionsContent() {
  const [status, setStatus] = useQueryParam("status", "all");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/submit`
    : "/submit";

  useEffect(() => {
    setLoading(true);
    getSubmissions(status === "all" ? undefined : status).then((result) => {
      setSubmissions(result.data || []);
      setLoading(false);
    });
  }, [status]);

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return submissions;
    const q = debouncedSearch.toLowerCase();
    return submissions.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.subjectName.toLowerCase().includes(q) ||
        s.topicName.toLowerCase().includes(q) ||
        s.batch.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
    );
  }, [submissions, debouncedSearch]);

  useEffect(() => { setPage(1); }, [debouncedSearch, status]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Submissions</h1>
        <Link href="/submissions/settings">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Form Settings
          </Button>
        </Link>
      </div>

      {/* Public submission link */}
      <Card className="mb-6 border-dashed">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 px-4">
          <div className="min-w-0">
            <p className="text-sm font-medium mb-0.5">Public Submission Form</p>
            <p className="text-xs text-muted-foreground truncate">
              Share this link with students to collect note submissions
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <code className="hidden md:block text-xs bg-muted px-2.5 py-1 rounded-md font-mono max-w-[300px] truncate">
              {publicUrl}
            </code>
            <CopyButton text={publicUrl} />
            <a href="/submit" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Open
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search submissions..."
        />
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              variant={status === tab.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatus(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <>
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Dept</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.name}</TableCell>
                  <TableCell className="text-sm">{sub.subjectName}</TableCell>
                  <TableCell className="text-sm">{sub.topicName}</TableCell>
                  <TableCell className="text-sm">{sub.batch}</TableCell>
                  <TableCell className="text-sm">{sub.department}</TableCell>
                  <TableCell>
                    <StatusBadge status={sub.status} />
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Link href={`/submissions/${sub.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-8"
                  >
                    {search ? "No submissions match your search" : "No submissions found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          totalItems={filtered.length}
        />
        </>
      )}
    </div>
  );
}

export default function SubmissionsPage() {
  return (
    <Suspense fallback={<div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}>
      <SubmissionsContent />
    </Suspense>
  );
}
