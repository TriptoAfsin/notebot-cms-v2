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
    { title: "Levels", value: stats.levels, icon: Layers, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10" },
    { title: "Subjects", value: stats.subjects, icon: GraduationCap, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
    { title: "Topics", value: stats.topics, icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { title: "Notes", value: stats.notes, icon: FileText, color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-500/10" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`h-8 w-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
