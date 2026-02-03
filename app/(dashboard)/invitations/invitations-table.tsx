"use client";

import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CopyLinkButton } from "./copy-link-button";
import { DeleteInvitationButton } from "./delete-button";
import { SearchInput } from "@/components/search-input";
import { TablePagination } from "@/components/table-pagination";
import { useDebounce } from "@/hooks/use-debounce";

type Invitation = {
  id: number;
  token: string;
  email: string | null;
  role: string;
  usedBy: string | null;
  expiresAt: Date;
  createdAt: Date;
};

function getStatus(invitation: { usedBy: string | null; expiresAt: Date }) {
  if (invitation.usedBy) return "used";
  if (new Date() > new Date(invitation.expiresAt)) return "expired";
  return "active";
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "used":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
          Used
        </Badge>
      );
    case "expired":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400">
          Expired
        </Badge>
      );
    default:
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
          Active
        </Badge>
      );
  }
}

export function InvitationsTable({ invitations }: { invitations: Invitation[] }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return invitations;
    const q = debouncedSearch.toLowerCase();
    return invitations.filter(
      (inv) =>
        inv.token.toLowerCase().includes(q) ||
        (inv.email && inv.email.toLowerCase().includes(q)) ||
        inv.role.toLowerCase().includes(q)
    );
  }, [invitations, debouncedSearch]);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search invitations..."
        />
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-24">Role</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-28">Created</TableHead>
              <TableHead className="w-28">Expires</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((inv) => {
              const status = getStatus(inv);
              return (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs">
                    {inv.token.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="text-sm">{inv.email || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={inv.role === "admin" ? "default" : "secondary"} className="capitalize">
                      {inv.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={status} />
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(inv.expiresAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {status === "active" && (
                        <CopyLinkButton token={inv.token} />
                      )}
                      <DeleteInvitationButton id={inv.id} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  {search ? "No invitations match your search" : "No invitations found"}
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
  );
}
