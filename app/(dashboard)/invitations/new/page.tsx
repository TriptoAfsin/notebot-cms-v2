"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createInvitation } from "@/actions/invitations.action";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  role: z.enum(["admin", "user"]),
  expiresInDays: z.string(),
});

type FormValues = z.infer<typeof schema>;

export default function NewInvitationPage() {
  const router = useRouter();
  const [generatedLink, setGeneratedLink] = useState("");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", role: "user", expiresInDays: "7" },
  });

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    if (data.email) formData.set("email", data.email);
    formData.set("role", data.role);
    formData.set("expiresInDays", data.expiresInDays);

    const result = await createInvitation(formData);
    if (result.success && result.token) {
      const link = `${window.location.origin}/invite/${result.token}`;
      setGeneratedLink(link);
      toast.success("Invitation created");
    } else {
      toast.error("Failed to create invitation");
    }
  };

  if (generatedLink) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Invitation Created</h1>
        <Card>
          <CardHeader>
            <CardTitle>Share this link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={generatedLink} readOnly className="font-mono text-sm" />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(generatedLink);
                  toast.success("Link copied to clipboard");
                }}
              >
                Copy
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/invitations")}
            >
              Back to Invitations
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create Invitation</h1>
      <Card>
        <CardHeader>
          <CardTitle>Invitation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              <p className="text-xs text-muted-foreground">
                If set, the email will be pre-filled during registration.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Expires In</Label>
              <Controller
                name="expiresInDays"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Invitation"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/invitations")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
