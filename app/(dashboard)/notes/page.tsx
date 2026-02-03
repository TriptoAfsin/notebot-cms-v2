import Link from "next/link";
import { getNotes } from "@/services/notes";
import { getTopics } from "@/services/topics";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { DeleteNoteButton } from "./delete-button";

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ topicId?: string }>;
}) {
  const { topicId } = await searchParams;
  const parsedTopicId = topicId ? parseInt(topicId) : undefined;
  const [notes, topics] = await Promise.all([getNotes(parsedTopicId), getTopics()]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notes</h1>
        <Link href="/notes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-medium">Filter by Topic:</span>
        <div className="flex gap-2">
          <Link href="/notes">
            <Button variant={!parsedTopicId ? "default" : "outline"} size="sm">
              All
            </Button>
          </Link>
          {topics.map((topic) => (
            <Link key={topic.id} href={`/notes?topicId=${topic.id}`}>
              <Button
                variant={parsedTopicId === topic.id ? "default" : "outline"}
                size="sm"
              >
                {topic.displayName}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Sort Order</TableHead>
            <TableHead>Metadata</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notes.map((note) => (
            <TableRow key={note.id}>
              <TableCell>{note.id}</TableCell>
              <TableCell>{note.topicName}</TableCell>
              <TableCell>{note.title}</TableCell>
              <TableCell>
                <a
                  href={note.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  {note.url.length > 50 ? `${note.url.slice(0, 50)}...` : note.url}
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              </TableCell>
              <TableCell>{note.sortOrder}</TableCell>
              <TableCell>{note.metadata ? JSON.stringify(note.metadata).slice(0, 50) + '...' : '-'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href={`/notes/${note.id}`}>
                    <Button variant="outline" size="icon-xs">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <DeleteNoteButton id={note.id} topicId={note.topicId} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {notes.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No notes found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
