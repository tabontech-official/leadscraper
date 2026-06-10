import { JobsList } from "@/components/dashboard/jobs-list";

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Jobs</h1>
        <p className="text-muted-foreground">Track your search job progress</p>
      </div>
      <JobsList />
    </div>
  );
}
