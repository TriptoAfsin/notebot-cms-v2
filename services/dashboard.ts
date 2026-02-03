import { db } from "@/lib/db";
import {
  levels,
  subjects,
  topics,
  notes,
  labReports,
  questionBanks,
  routines,
  noteSubmissions,
} from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

export async function getDashboardData() {
  const [
    levelRows,
    subjectRows,
    topicRows,
    noteRows,
    labReportRows,
    questionBankRows,
    routineRows,
    submissionRows,
  ] = await Promise.all([
    db.select().from(levels),
    db.select().from(subjects),
    db.select().from(topics),
    db.select().from(notes),
    db.select().from(labReports),
    db.select().from(questionBanks),
    db.select().from(routines),
    db.select().from(noteSubmissions),
  ]);

  // Notes per level: join notes → topics → subjects → levels
  const notesPerLevel = await db
    .select({
      levelName: levels.displayName,
      count: count(),
    })
    .from(notes)
    .innerJoin(topics, eq(notes.topicId, topics.id))
    .innerJoin(subjects, eq(topics.subjectId, subjects.id))
    .innerJoin(levels, eq(subjects.levelId, levels.id))
    .groupBy(levels.displayName)
    .orderBy(levels.displayName);

  // Subjects per level
  const subjectsPerLevel = await db
    .select({
      levelName: levels.displayName,
      count: count(),
    })
    .from(subjects)
    .innerJoin(levels, eq(subjects.levelId, levels.id))
    .groupBy(levels.displayName)
    .orderBy(levels.displayName);

  // Submission status breakdown
  const pendingCount = submissionRows.filter((s) => s.status === "pending").length;
  const approvedCount = submissionRows.filter((s) => s.status === "approved").length;
  const rejectedCount = submissionRows.filter((s) => s.status === "rejected").length;

  // Recent submissions (last 10)
  const recentSubmissions = submissionRows
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)
    .map((s) => ({
      id: s.id,
      name: s.name,
      subjectName: s.subjectName,
      topicName: s.topicName,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
    }));

  // Submissions per department
  const submissionsByDept: Record<string, number> = {};
  submissionRows.forEach((s) => {
    submissionsByDept[s.department] = (submissionsByDept[s.department] || 0) + 1;
  });
  const deptData = Object.entries(submissionsByDept)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Content per type for bar chart
  const contentBreakdown = [
    { name: "Notes", count: noteRows.length },
    { name: "Lab Reports", count: labReportRows.length },
    { name: "Q. Banks", count: questionBankRows.length },
    { name: "Routines", count: routineRows.length },
  ];

  return {
    stats: {
      levels: levelRows.length,
      subjects: subjectRows.length,
      topics: topicRows.length,
      notes: noteRows.length,
      labReports: labReportRows.length,
      questionBanks: questionBankRows.length,
      routines: routineRows.length,
      submissions: submissionRows.length,
    },
    notesPerLevel: notesPerLevel.map((r) => ({
      name: r.levelName,
      notes: Number(r.count),
    })),
    subjectsPerLevel: subjectsPerLevel.map((r) => ({
      name: r.levelName,
      subjects: Number(r.count),
    })),
    submissionStatus: [
      { name: "Pending", value: pendingCount, fill: "#f59e0b" },
      { name: "Approved", value: approvedCount, fill: "#22c55e" },
      { name: "Rejected", value: rejectedCount, fill: "#ef4444" },
    ],
    recentSubmissions,
    deptData,
    contentBreakdown,
  };
}
