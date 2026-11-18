"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Ban, CheckCircle2 } from "lucide-react";

export default function AdminManageUsersPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [userList, setUserList] = React.useState([
    {
      id: "USR-01",
      name: "Eleanor Vance",
      email: "eleanor@example.com",
      role: "Customer",
      joined: "Nov 18, 2026",
      status: "Active",
    },
    {
      id: "USR-02",
      name: "Meadow View Estate",
      email: "events@meadowview.com",
      role: "Vendor",
      joined: "Nov 17, 2026",
      status: "Active",
    },
    {
      id: "USR-03",
      name: "Lumiere Studios",
      email: "hello@lumiere.com",
      role: "Vendor",
      joined: "Nov 15, 2026",
      status: "Active",
    },
    {
      id: "USR-04",
      name: "Noah Sterling",
      email: "noah.sterling@example.com",
      role: "Customer",
      joined: "Nov 12, 2026",
      status: "Active",
    },
    {
      id: "USR-05",
      name: "Vintage Carriage Co.",
      email: "info@vintagecarriage.com",
      role: "Vendor",
      joined: "Nov 10, 2026",
      status: "Suspended",
    },
  ]);

  const filteredUsers = userList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setUserList((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          return {
            ...u,
            status: u.status === "Active" ? "Suspended" : "Active",
          };
        }
        return u;
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Manage Users
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Directory of all registered couples, wedding planners, and verified vendors
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          user.role === "Vendor"
                            ? "bg-[#99616E]/15 text-[#99616E]"
                            : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {user.joined}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          user.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-destructive/10 text-destructive border border-destructive/20"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => toggleStatus(user.id)}
                        className={user.status === "Active" ? "text-destructive hover:bg-destructive/10" : "text-emerald-600"}
                      >
                        {user.status === "Active" ? (
                          <>
                            <Ban className="size-3 mr-1" />
                            Suspend
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="size-3 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
