"use client";

import { DeleteDialog } from "@/components/delete-dialog";
import { deleteUser } from "@/actions/users";

export function DeleteUserButton({ id }: { id: string }) {
  return <DeleteDialog itemName="User" onDelete={() => deleteUser(id)} />;
}
