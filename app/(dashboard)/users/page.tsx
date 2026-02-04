import { getUsers } from "@/actions/users.action";
import { UsersTable } from "./users-table";

export default async function UsersPage() {
  const result = await getUsers();
  const users = result.data || [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Users are created through invitations
        </p>
      </div>

      <UsersTable users={users} />
    </div>
  );
}
