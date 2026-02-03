"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  GraduationCap,
  BookOpen,
  FileText,
  FlaskConical,
  HelpCircle,
  Calendar,
  FileInput,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type DashboardData = {
  stats: {
    levels: number;
    subjects: number;
    topics: number;
    notes: number;
    labReports: number;
    questionBanks: number;
    routines: number;
    submissions: number;
  };
  notesPerLevel: { name: string; notes: number }[];
  subjectsPerLevel: { name: string; subjects: number }[];
  submissionStatus: { name: string; value: number; fill: string }[];
  recentSubmissions: {
    id: number;
    name: string;
    subjectName: string;
    topicName: string;
    status: string;
    createdAt: string;
  }[];
  deptData: { name: string; value: number }[];
  contentBreakdown: { name: string; count: number }[];
};

const DEPT_COLORS = [
  "#8b5cf6",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

export function DashboardView({ data }: { data: DashboardData }) {
  const { stats } = data;

  const kpiCards = [
    { title: "Levels", value: stats.levels, icon: Layers, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10" },
    { title: "Subjects", value: stats.subjects, icon: GraduationCap, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
    { title: "Topics", value: stats.topics, icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { title: "Notes", value: stats.notes, icon: FileText, color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-500/10" },
    { title: "Lab Reports", value: stats.labReports, icon: FlaskConical, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-500/10" },
    { title: "Q. Banks", value: stats.questionBanks, icon: HelpCircle, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
    { title: "Routines", value: stats.routines, icon: Calendar, color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-500/10" },
    { title: "Submissions", value: stats.submissions, icon: FileInput, color: "text-lime-500", bg: "bg-lime-50 dark:bg-lime-500/10" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
        {kpiCards.map((card) => (
          <Card key={card.title} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className={`h-8 w-8 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Notes per Level */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Notes per Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.notesPerLevel} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  />
                  <Bar dataKey="notes" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Content Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Content Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.contentBreakdown} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.contentBreakdown.map((_, i) => (
                      <Cell key={i} fill={["#3b82f6", "#ec4899", "#f97316", "#14b8a6"][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {/* Submission Status Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Submission Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data.submissionStatus.every((s) => s.value === 0) ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No submissions yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.submissionStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {data.submissionStatus.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "13px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submissions by Department */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Submissions by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data.deptData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No submissions yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.deptData} layout="vertical" margin={{ top: 5, right: 10, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" width={40} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {data.deptData.map((_, i) => (
                        <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-y-auto space-y-2">
              {data.recentSubmissions.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No submissions yet
                </div>
              ) : (
                data.recentSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg border bg-muted/30"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{sub.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {sub.subjectName} &middot; {sub.topicName}
                      </p>
                    </div>
                    <StatusBadge status={sub.status} />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 shrink-0 text-[10px]">
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 shrink-0 text-[10px]">
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 shrink-0 text-[10px]">
          Pending
        </Badge>
      );
  }
}
