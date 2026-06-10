"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CsvRow {
  zip_code: string;
  category: string;
  state: string;
}

export function CsvUploadForm() {
  const router = useRouter();
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [preview, setPreview] = useState<CsvRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [resultsPerRow, setResultsPerRow] = useState("10");
  const [provider, setProvider] = useState("serpapi");
  const [runTech, setRunTech] = useState(true);
  const [maxResults, setMaxResults] = useState(10);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setLoading(true);
    setErrors([]);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload-csv", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? [data.error]);
        toast.error(data.error ?? "Upload failed");
        return;
      }
      setRows(data.rows);
      setPreview(data.preview);
      setMaxResults(data.limits?.maxResultsPerRow ?? 10);
      toast.success(`Validated ${data.totalRows} rows`);
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  const startSearch = async () => {
    if (rows.length === 0) {
      toast.error("Upload a valid CSV first");
      return;
    }
    setStarting(true);
    try {
      const res = await fetch("/api/jobs/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows,
          resultsPerRow: parseInt(resultsPerRow, 10),
          searchProvider: provider,
          runTechImmediately: runTech,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to start job");
        return;
      }
      toast.success("Search job started");
      router.push(`/dashboard/jobs/${data.job.id}`);
    } catch {
      toast.error("Failed to start job");
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-muted-foreground">
              {loading
                ? "Validating..."
                : isDragActive
                  ? "Drop CSV here"
                  : "Drag & drop CSV, or click to select"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Required columns: zip_code, category, state
            </p>
          </div>
          {errors.length > 0 && (
            <div className="mt-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              <ul className="list-disc pl-4">
                {errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview (first 10 rows)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>zip_code</TableHead>
                  <TableHead>category</TableHead>
                  <TableHead>state</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{row.zip_code}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.state}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Results per row</Label>
                <Select value={resultsPerRow} onValueChange={setResultsPerRow}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: maxResults }, (_, i) => i + 1).map(
                      (n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Search provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="serpapi">SerpAPI (Google Maps)</SelectItem>
                    <SelectItem value="google_places">
                      Google Places API
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="tech"
                checked={runTech}
                onCheckedChange={(v) => setRunTech(v === true)}
              />
              <Label htmlFor="tech">Run tech detection immediately</Label>
            </div>
            <Button onClick={startSearch} disabled={starting} size="lg">
              {starting ? "Starting..." : "Start Search"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
