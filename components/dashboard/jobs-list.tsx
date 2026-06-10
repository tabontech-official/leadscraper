"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Job {
  id: string;
  name: string | null;
  status: string;
  totalRows: number;
  processedRows: number;
  totalLeadsFound: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  COMPLETED: "default",
  RUNNING: "secondary",
  PENDING: "outline",
  FAILED: "outline",
  CANCELLED: "outline",
};

export function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search jobs</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : jobs.length === 0 ? (
          <p className="text-muted-foreground">
            No jobs yet.{" "}
            <Link href="/dashboard/upload" className="text-primary">
              Upload a CSV
            </Link>
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/jobs/${job.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {job.name ?? job.id.slice(0, 8)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[job.status] ?? "outline"}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {job.processedRows}/{job.totalRows}
                  </TableCell>
                  <TableCell>{job.totalLeadsFound}</TableCell>
                  <TableCell>
                    {new Date(job.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
