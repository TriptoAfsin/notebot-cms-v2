"use client";

import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Subject = {
  id: number;
  displayName: string;
};

export function SubjectFilter({
  subjects,
  currentSubjectId,
}: {
  subjects: Subject[];
  currentSubjectId?: number;
}) {
  const router = useRouter();

  const handleChange = (value: string) => {
    if (value === "all") {
      router.push("/topics");
    } else {
      router.push(`/topics?subjectId=${value}`);
    }
  };

  return (
    <Select value={currentSubjectId?.toString() ?? "all"} onValueChange={handleChange}>
      <SelectTrigger>
        <SelectValue placeholder="All Subjects" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Subjects</SelectItem>
        {subjects.map((subject) => (
          <SelectItem key={subject.id} value={subject.id.toString()}>
            {subject.displayName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
