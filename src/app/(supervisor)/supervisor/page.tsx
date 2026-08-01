"use client";

import { Beef, Milk, Tractor, Users } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { useSupervisor } from "@/features/supervisor/hooks/use-supervisor";

export default function SupervisorDashboard() {
  const { analytics } = useSupervisor();

  if (analytics.isLoading) return <LoadingState label="Loading global analytics..." />;
  
  if (analytics.isError || !analytics.data) {
    return (
      <ErrorState 
        title="Access Denied" 
        message="Unable to fetch supervisor analytics. Ensure you have superadmin privileges."
        onRetry={() => analytics.refetch()} 
      />
    );
  }

  const { data } = analytics;

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Global Analytics" 
        description="Platform-wide aggregated metrics across all registered farms." 
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Farms"
          value={data.total_farms.toLocaleString()}
          icon={Tractor}
        />
        <StatCard
          label="Total Users"
          value={data.total_users.toLocaleString()}
          icon={Users}
        />
        <StatCard
          label="Total Cattle"
          value={data.total_cattle.toLocaleString()}
          icon={Beef}
        />
        <StatCard
          label="Total Milk Yield"
          value={`${data.total_milk_liters.toLocaleString(undefined, { maximumFractionDigits: 1 })} L`}
          icon={Milk}
        />
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">Registered Farms</h2>
        </CardHeader>
        <CardContent>
          {data.farms.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No farms registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="pb-3 font-semibold">Farm ID</th>
                    <th className="pb-3 font-semibold">Name</th>
                    <th className="pb-3 font-semibold">Location</th>
                    <th className="pb-3 font-semibold">Registered</th>
                    <th className="pb-3 font-semibold text-right">Users</th>
                    <th className="pb-3 font-semibold text-right">Cattle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.farms.map((farm) => (
                    <tr key={farm.id} className="hover:bg-muted/30">
                      <td className="py-3 font-mono text-xs text-muted-foreground">#{farm.id}</td>
                      <td className="py-3 font-medium">{farm.name}</td>
                      <td className="py-3">{farm.location || "-"}</td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(farm.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">{farm.user_count}</td>
                      <td className="py-3 text-right">{farm.cattle_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
