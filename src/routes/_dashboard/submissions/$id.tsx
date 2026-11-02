import { createFileRoute, redirect } from "@tanstack/react-router";

/** Old per-submission URLs (emails, bookmarks) open the review queue with that submission selected. */
export const Route = createFileRoute("/_dashboard/submissions/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({ href: `/submissions?status=all&id=${encodeURIComponent(params.id)}` });
  },
});
