"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface JobDetailProps {
  jobId: string;
}

export function JobDetail({ jobId }: JobDetailProps) {
  const [job, setJob] = useState<{
    id: string;
    name: string | null;
    status: string;
    totalRows: number;
    processedRows: number;
    totalLeadsFound: number;
    errorMessage: string | null;
    leads: Array<{
      id: string;
      businessName: string | null;
      website: string | null;
      primaryTech: string | null;
      email: string | null;
    }>;
  } | null>(null);

  useEffect(() => {
    const load = () => {
      fetch(`/api/jobs/${jobId}`)
        .then((r) => r.json())
        .then((d) => setJob(d.job));
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [jobId]);

  if (!job) {
    return <p className="text-muted-foreground">Loading job...</p>;
  }

  const progress =
    job.totalRows > 0
      ? Math.round((job.processedRows / job.totalRows) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {job.name ?? "Search job"}
            <Badge>{job.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Progress</span>
              <span>
                {job.processedRows} / {job.totalRows} rows ({progress}%)
              </span>
            </div>
            <Progress value={progress} />
          </div>
          <p className="text-sm">
            <strong>Leads found:</strong> {job.totalLeadsFound}
          </p>
          {job.errorMessage && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {job.errorMessage}
            </p>
          )}
          <Link href="/dashboard/leads" className="text-sm text-primary">
            View all leads →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent leads from this job</CardTitle>
        </CardHeader>
        <CardContent>
          {job.leads?.length === 0 ? (
            <p className="text-muted-foreground">No leads yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Tech</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {job.leads?.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>{lead.businessName ?? "—"}</TableCell>
                    <TableCell>{lead.website ?? "—"}</TableCell>
                    <TableCell>{lead.primaryTech ?? "—"}</TableCell>
                    <TableCell>{lead.email ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
