import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@prisma/client";
import { UserRoleActions } from "./user-role-actions";

const roleVariant: Record<UserRole, "default" | "success" | "warning" | "secondary" | "destructive"> = {
  CREATOR: "default",
  BRAND: "success",
  ADMIN: "warning",
};

const roleLabel: Record<UserRole, string> = {
  CREATOR: "Creator",
  BRAND: "Brand",
  ADMIN: "Admin",
};

export default async function AdminUsersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "ADMIN") redirect("/");

  const users = await prisma.user.findMany({
    include: {
      creatorProfile: { select: { displayName: true } },
      brandProfile: { select: { companyName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">{users.length} total</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Email</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Name</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Role</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Joined</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => {
                    const name =
                      u.creatorProfile?.displayName ??
                      u.brandProfile?.companyName ??
                      "—";
                    return (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 text-gray-900 max-w-[220px] truncate">{u.email}</td>
                        <td className="px-5 py-4 text-gray-600">{name}</td>
                        <td className="px-5 py-4">
                          <Badge variant={roleVariant[u.role]}>{roleLabel[u.role]}</Badge>
                        </td>
                        <td className="px-5 py-4 text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString("en-US")}
                        </td>
                        <td className="px-5 py-4">
                          <UserRoleActions userId={u.id} currentRole={u.role} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
