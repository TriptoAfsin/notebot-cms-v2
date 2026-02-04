"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createLevelAction } from "@/actions/levels.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  displayName: z.string().min(1, "Display name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(50),
  sortOrder: z.coerce.number().int().default(0),
});

type FormValues = z.infer<typeof schema>;

export default function NewLevelPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", displayName: "", slug: "", sortOrder: 0 },
  });

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("displayName", data.displayName);
    formData.set("slug", data.slug);
    formData.set("sortOrder", String(data.sortOrder));
    const result = await createLevelAction(formData);
    if (result.success) {
      toast.success("Level created");
      router.push("/levels");
    } else {
      toast.error("Failed to create level");
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create Level</h1>
      <Card>
        <CardHeader>
          <CardTitle>Level Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="level_1" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" placeholder="Level 1" {...register("displayName")} />
              {errors.displayName && <p className="text-xs text-destructive">{errors.displayName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" placeholder="1" {...register("slug")} />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input id="sortOrder" type="number" {...register("sortOrder")} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/levels")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
