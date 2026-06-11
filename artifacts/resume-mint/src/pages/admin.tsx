import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { useGetAdminStats, useListAdminUsers } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, CreditCard, TrendingUp, Calendar } from "lucide-react";

function AdminContent() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: users, isLoading: usersLoading } = useListAdminUsers();

  const statCards = stats ? [
    { label: "Total Users", value: stats.totalUsers, icon: Users },
    { label: "Total Resumes", value: stats.totalResumes, icon: FileText },
    { label: "Resumes This Month", value: stats.resumesThisMonth, icon: Calendar },
    { label: "Total Revenue", value: `₹${stats.totalRevenue}`, icon: TrendingUp },
    { label: "Total Payments", value: stats.totalPayments, icon: CreditCard },
    { label: "Revenue This Month", value: `₹${stats.revenueThisMonth}`, icon: Calendar },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto pt-6">
          <div className="mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Platform analytics and user management</p>
          </div>

          {/* Stats */}
          {statsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
              {statCards.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-xl border border-border/60 bg-card p-5">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                    <Icon className="w-3.5 h-3.5" />{label}
                  </div>
                  <div className="font-display text-2xl font-bold" data-testid={`stat-${label.toLowerCase().replace(/ /g, "-")}`}>{value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Users table */}
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60">
              <h2 className="font-semibold">Users</h2>
            </div>
            {usersLoading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}
              </div>
            ) : !users?.length ? (
              <div className="p-10 text-center text-muted-foreground text-sm">No users yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr>
                      {["Name / Email", "Resumes", "Total Spent", "Joined"].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/20 transition-colors" data-testid={`row-user-${u.id}`}>
                        <td className="px-5 py-3">
                          <div className="font-medium">{u.displayName ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </td>
                        <td className="px-5 py-3">{u.resumeCount}</td>
                        <td className="px-5 py-3">₹{u.totalSpent}</td>
                        <td className="px-5 py-3 text-muted-foreground text-xs">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Admin() {
  return <ProtectedRoute><AdminContent /></ProtectedRoute>;
}
