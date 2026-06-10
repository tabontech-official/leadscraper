import { StatCards } from "@/components/dashboard/stat-cards";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your leads and search jobs
          </p>
        </div>
        <Link href="/dashboard/upload">
          <Button>Upload CSV</Button>
        </Link>
      </div>
      <StatCards />
    </div>
  );
}
