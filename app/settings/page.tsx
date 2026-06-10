import { getAuthUser } from "@/lib/auth";
import { getPlanLimits } from "@/lib/plans/limits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function SettingsPage() {
  const user = await getAuthUser();
  const limits = user ? getPlanLimits(user.plan) : null;

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto bg-muted/20 p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Account and plan information</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Plan
                {user && <Badge>{user.plan}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {user ? (
                <>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Uploads this month:</strong> {user.uploadsThisMonth}
                  </p>
                  {limits && (
                    <ul className="mt-4 list-disc space-y-1 pl-5 text-muted-foreground">
                      <li>{limits.uploadsPerMonth} CSV uploads per month</li>
                      <li>{limits.maxRowsPerCsv} rows per CSV</li>
                      <li>{limits.maxResultsPerRow} results per row</li>
                      <li>{limits.maxLeads.toLocaleString()} max leads</li>
                    </ul>
                  )}
                  <p className="mt-4 text-muted-foreground">
                    Stripe billing integration coming soon. Plans: Free, Pro,
                    Agency.
                  </p>
                </>
              ) : (
                <p>Sign in to view settings.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
