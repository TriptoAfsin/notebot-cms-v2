"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { createInvitation } from "@/actions/invitations";
import { toast } from "sonner";

export default function NewInvitationPage() {
  const router = useRouter();
  const [role, setRole] = useState("user");
  const [expiresInDays, setExpiresInDays] = useState("7");
  const [generatedLink, setGeneratedLink] = useState("");

  const handleSubmit = async (formData: FormData) => {
    formData.set("role", role);
    formData.set("expiresInDays", expiresInDays);

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
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="user@example.com"
              />
              <p className="text-xs text-muted-foreground">
                If set, the email will be pre-filled during registration.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Expires In</Label>
              <Select value={expiresInDays} onValueChange={setExpiresInDays}>
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
            </div>

            <div className="flex gap-2">
              <Button type="submit">Create Invitation</Button>
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
