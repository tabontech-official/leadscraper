"use client";

import { useState, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { X, Upload, FileText, AlertCircle } from "lucide-react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { toast } from "sonner";

interface ImportCsvModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EXPECTED_COLUMNS = [
  "name",
  "website",
  "profileUrl",
  "profile_url",
  "email",
  "phone",
  "country",
  "city",
  "services",
  "specialization",
  "rating",
  "reviewsCount",
  "reviews_count",
  "sourceUrl",
  "source_url",
  "description",
  "category",
  "status",
  "socialLinks",
  "social_links",
];

function normalizeKey(key: string): string {
  const map: Record<string, string> = {
    profile_url: "profileUrl",
    reviews_count: "reviewsCount",
    source_url: "sourceUrl",
    social_links: "socialLinks",
    business_name: "name",
  };
  const trimmed = key.trim().toLowerCase();
  return map[trimmed] ?? trimmed;
}

export function ImportCsvModal({
  open,
  onOpenChange,
  onSuccess,
}: ImportCsvModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    failed: number;
    errors: any[];
  } | null>(null);

  const reset = () => {
    setFile(null);
    setParsedRows([]);
    setColumns([]);
    setResult(null);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    setResult(null);

    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const fields = results.meta.fields ?? [];
        setColumns(fields);
        const normalized = results.data.map((row: any) => {
          const out: any = {};
          for (const key of Object.keys(row)) {
            out[normalizeKey(key)] = row[key];
          }
          return out;
        });
        setParsedRows(normalized);
      },
      error: () => {
        toast.error("Failed to parse CSV file");
      },
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  const handleImport = async () => {
    if (parsedRows.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch("/api/hire-shopify-experts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsedRows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setResult(data);
      toast.success(
        `Imported ${data.imported} leads (${data.failed} failed)`
      );
      if (data.imported > 0) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!importing) {
          onOpenChange(v);
          if (!v) reset();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl max-h-[85vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
            <X className="h-4 w-4" />
          </Dialog.Close>
          <Dialog.Title className="text-lg font-semibold">
            Import Leads from CSV
          </Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mt-1">
            Upload a CSV file with Shopify expert lead data. Expected columns:
            name, website, email, phone, country, services, rating, etc.
          </Dialog.Description>

          {!file ? (
            <div
              {...getRootProps()}
              className={`mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">
                Drop a CSV file here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Only .csv files are supported
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {parsedRows.length} rows &bull; {columns.length} columns
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reset}
                  disabled={importing}
                >
                  Remove
                </Button>
              </div>

              {columns.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Detected columns:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {columns.map((col) => (
                      <span
                        key={col}
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                          EXPECTED_COLUMNS.includes(
                            col.trim().toLowerCase()
                          ) ||
                          EXPECTED_COLUMNS.includes(normalizeKey(col))
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {parsedRows.length > 0 && (
                <div className="rounded-lg border overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-2 py-1.5 text-left font-medium">
                          #
                        </th>
                        {columns.slice(0, 5).map((col) => (
                          <th
                            key={col}
                            className="px-2 py-1.5 text-left font-medium"
                          >
                            {col}
                          </th>
                        ))}
                        {columns.length > 5 && (
                          <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">
                            +{columns.length - 5} more
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-2 py-1.5 text-muted-foreground">
                            {i + 1}
                          </td>
                          {columns.slice(0, 5).map((col) => (
                            <td
                              key={col}
                              className="px-2 py-1.5 max-w-[150px] truncate"
                            >
                              {row[normalizeKey(col)] ?? ""}
                            </td>
                          ))}
                          {columns.length > 5 && (
                            <td className="px-2 py-1.5 text-muted-foreground">
                              &hellip;
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedRows.length > 5 && (
                    <p className="px-2 py-1.5 text-xs text-muted-foreground bg-muted/30">
                      Showing first 5 of {parsedRows.length} rows
                    </p>
                  )}
                </div>
              )}

              {result && (
                <div className="rounded-lg border p-3 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-green-600">
                      &#10003; {result.imported}
                    </span>{" "}
                    imported
                    {result.failed > 0 && (
                      <>
                        ,{" "}
                        <span className="font-medium text-destructive">
                          &#10007; {result.failed}
                        </span>{" "}
                        failed
                      </>
                    )}
                  </p>
                  {result.errors.length > 0 && (
                    <div className="space-y-1">
                      {result.errors.map((err: any, i: number) => (
                        <p
                          key={i}
                          className="flex items-start gap-1 text-xs text-destructive"
                        >
                          <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                          Row {err.row}: {err.message}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
              disabled={importing}
            >
              {result ? "Close" : "Cancel"}
            </Button>
            {file && !result && (
              <Button
                onClick={handleImport}
                disabled={importing || parsedRows.length === 0}
              >
                {importing
                  ? "Importing..."
                  : `Import ${parsedRows.length} leads`}
              </Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
