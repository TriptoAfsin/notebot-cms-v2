import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, GraduationCap, BookOpen, FileText } from "lucide-react";
import { db } from "@/lib/db";
import { levels, subjects, topics, notes } from "@/lib/db/schema";

async function getStats() {
  const [levelRows, subjectRows, topicRows, noteRows] = await Promise.all([
    db.select().from(levels),
    db.select().from(subjects),
    db.select().from(topics),
    db.select().from(notes),
  ]);

  return {
    levels: levelRows.length,
    subjects: subjectRows.length,
    topics: topicRows.length,
    notes: noteRows.length,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { title: "Levels", value: stats.levels, icon: Layers },
    { title: "Subjects", value: stats.subjects, icon: GraduationCap },
    { title: "Topics", value: stats.topics, icon: BookOpen },
    { title: "Notes", value: stats.notes, icon: FileText },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
