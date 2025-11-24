import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface UserRow {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "admin" | "staff";
  status: "active" | "inactive";
  created: string;
  last_active: string | null;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("http://10.80.26.210:8000/api/users/", {
        credentials: "include",
      });

      const data = await res.json();
      setUsers(data.users || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-4">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-slate-900 mb-2">User Management</h2>

      <Card>
        <CardHeader>
          <CardTitle>User Accounts</CardTitle>
        </CardHeader>

        <CardContent>
          <table className="w-full border rounded-lg">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2 text-left">Username</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">First Name</th>
                <th className="p-2 text-left">Last Name</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Created</th>
                <th className="p-2 text-left">Last Active</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="p-2">{u.username}</td>
                  <td className="p-2">{u.email}</td>

                  {/* First Name */}
                  <td className="p-2">{u.first_name || "—"}</td>

                  {/* Last Name */}
                  <td className="p-2">{u.last_name || "—"}</td>

                  {/* Role Badge */}
                  <td className="p-2">
                    <Badge
                      className={
                        u.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }
                    >
                      {u.role}
                    </Badge>
                  </td>

                  {/* Status Badge */}
                  <td className="p-2">
                    <Badge
                      className={
                        u.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {u.status}
                    </Badge>
                  </td>

                  {/* Created */}
                  <td className="p-2">
                    {new Date(u.created).toLocaleDateString()}
                  </td>

                  {/* Last Active */}
                  <td className="p-2">
                    {u.last_active
                      ? new Date(u.last_active).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
