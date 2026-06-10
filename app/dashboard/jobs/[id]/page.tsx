import { JobDetail } from "@/components/dashboard/job-detail";

export default function JobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Job details</h1>
        <p className="text-muted-foreground">Monitor progress and recent leads</p>
      </div>
      <JobDetail jobId={params.id} />
    </div>
  );
}
