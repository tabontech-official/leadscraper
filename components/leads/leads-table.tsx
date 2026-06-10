"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Lead {
  id: string;
  businessName: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  category: string | null;
  domain: string | null;
  primaryTech: string | null;
  techConfidence: number | null;
  source: string | null;
  createdAt: string;
}

interface Filters {
  search: string;
  domain: string;
  state: string;
  category: string;
  zipCode: string;
  primaryTech: string;
  hasEmail: boolean;
  hasPhone: boolean;
  hasWebsite: boolean;
  confidenceMin: string;
  jobId: string;
}

const TECH_OPTIONS = [
  "",
  "Shopify",
  "WordPress",
  "WooCommerce",
  "Wix",
  "Squarespace",
  "Webflow",
  "React",
  "Next.js",
  "Magento",
  "BigCommerce",
];

export function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState<Filters>({
    search: "",
    domain: "",
    state: "",
    category: "",
    zipCode: "",
    primaryTech: "",
    hasEmail: false,
    hasPhone: false,
    hasWebsite: false,
    confidenceMin: "",
    jobId: "",
  });

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (sorting[0]) {
      params.set("sortBy", sorting[0].id);
      params.set("sortDir", sorting[0].desc ? "desc" : "asc");
    }
    if (filters.search) params.set("search", filters.search);
    if (filters.domain) params.set("domain", filters.domain);
    if (filters.state) params.set("state", filters.state);
    if (filters.category) params.set("category", filters.category);
    if (filters.zipCode) params.set("zipCode", filters.zipCode);
    if (filters.primaryTech) params.set("primaryTech", filters.primaryTech);
    if (filters.hasEmail) params.set("hasEmail", "true");
    if (filters.hasPhone) params.set("hasPhone", "true");
    if (filters.hasWebsite) params.set("hasWebsite", "true");
    if (filters.confidenceMin)
      params.set("confidenceMin", filters.confidenceMin);
    if (filters.jobId) params.set("jobId", filters.jobId);
    return params.toString();
  }, [page, pageSize, sorting, filters]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads?${buildQuery()}`);
      const data = await res.json();
      if (res.ok) {
        setLeads(data.leads);
        setTotal(data.pagination.total);
      }
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const exportCsv = async (ids?: string[]) => {
    const params = new URLSearchParams(buildQuery());
    if (ids?.length) params.set("ids", ids.join(","));
    window.open(`/api/leads/export?${params.toString()}`, "_blank");
  };

  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
          />
        ),
      },
      { accessorKey: "businessName", header: "Business" },
      {
        accessorKey: "website",
        header: "Website",
        cell: ({ row }) =>
          row.original.website ? (
            <a
              href={row.original.website}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              {row.original.domain ?? row.original.website}
            </a>
          ) : (
            "—"
          ),
      },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "state", header: "State" },
      { accessorKey: "category", header: "Category" },
      {
        accessorKey: "primaryTech",
        header: "Tech",
        cell: ({ row }) =>
          row.original.primaryTech ? (
            <Badge variant="secondary">{row.original.primaryTech}</Badge>
          ) : (
            "—"
          ),
      },
      { accessorKey: "techConfidence", header: "Confidence" },
      { accessorKey: "source", header: "Source" },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString(),
      },
    ],
    []
  );

  const table = useReactTable({
    data: leads,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting, rowSelection: selected },
    onRowSelectionChange: setSelected,
    getRowId: (row) => row.id,
    manualSorting: true,
    manualPagination: true,
  });

  const selectedIds = Object.keys(selected).filter((k) => selected[k]);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Business name</Label>
              <Input
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                placeholder="Search..."
              />
            </div>
            <div className="space-y-2">
              <Label>Domain</Label>
              <Input
                value={filters.domain}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, domain: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input
                value={filters.state}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, state: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={filters.category}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, category: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Zip code</Label>
              <Input
                value={filters.zipCode}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, zipCode: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Technology</Label>
              <Select
                value={filters.primaryTech || "all"}
                onValueChange={(v) =>
                  setFilters((f) => ({
                    ...f,
                    primaryTech: v === "all" ? "" : v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {TECH_OPTIONS.filter(Boolean).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Min confidence</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={filters.confidenceMin}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    confidenceMin: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={filters.hasEmail}
                onCheckedChange={(v) =>
                  setFilters((f) => ({ ...f, hasEmail: v === true }))
                }
              />
              Has email
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={filters.hasPhone}
                onCheckedChange={(v) =>
                  setFilters((f) => ({ ...f, hasPhone: v === true }))
                }
              />
              Has phone
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={filters.hasWebsite}
                onCheckedChange={(v) =>
                  setFilters((f) => ({ ...f, hasWebsite: v === true }))
                }
              />
              Has website
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => { setPage(1); fetchLeads(); }}>
              Apply filters
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  search: "",
                  domain: "",
                  state: "",
                  category: "",
                  zipCode: "",
                  primaryTech: "",
                  hasEmail: false,
                  hasPhone: false,
                  hasWebsite: false,
                  confidenceMin: "",
                  jobId: "",
                });
                setPage(1);
              }}
            >
              Clear filters
            </Button>
            <Button variant="secondary" onClick={() => exportCsv()}>
              Export filtered
            </Button>
            {selectedIds.length > 0 && (
              <Button onClick={() => exportCsv(selectedIds)}>
                Export selected ({selectedIds.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-muted-foreground">Loading leads...</p>
          ) : leads.length === 0 ? (
            <p className="text-muted-foreground">
              No leads yet. Upload a CSV to get started.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id}>
                      {hg.headers.map((h) => (
                        <TableHead key={h.id}>
                          {flexRender(
                            h.column.columnDef.header,
                            h.getContext()
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {total} leads total
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center text-sm">
                    Page {page} of {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
