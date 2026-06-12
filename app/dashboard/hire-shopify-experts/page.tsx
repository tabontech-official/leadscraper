"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Upload,
  Download,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import {
  DataTable,
  type ShopifyExpertLead,
} from "@/components/hire-shopify-experts/data-table";
import {
  Filters,
  emptyFilters,
  type FilterValues,
} from "@/components/hire-shopify-experts/filters";
import { LeadDetailModal } from "@/components/hire-shopify-experts/lead-detail-modal";
import { AddLeadModal } from "@/components/hire-shopify-experts/add-lead-modal";
import { ImportCsvModal } from "@/components/hire-shopify-experts/import-csv-modal";
import { DeleteConfirmDialog } from "@/components/hire-shopify-experts/delete-confirm-dialog";
import { ScrapeModal } from "@/components/hire-shopify-experts/scrape-modal";

export default function HireShopifyExpertsPage() {
  const [leads, setLeads] = useState<ShopifyExpertLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterValues>(emptyFilters);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modal states
  const [detailLead, setDetailLead] = useState<ShopifyExpertLead | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [scrapeOpen, setScrapeOpen] = useState(false);
  const [deleteLead, setDeleteLead] = useState<ShopifyExpertLead | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "25");
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      if (filters.search) params.set("search", filters.search);
      if (filters.country) params.set("country", filters.country);
      if (filters.service) params.set("service", filters.service);
      if (filters.rating) params.set("rating", filters.rating);
      if (filters.source) params.set("source", filters.source);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);

      const res = await fetch(
        `/api/hire-shopify-experts?${params.toString()}`
      );
      if (!res.ok) throw new Error("Failed to fetch leads");
      const data = await res.json();
      setLeads(data.leads);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Debounce filter changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [filters]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.country) params.set("country", filters.country);
    if (filters.service) params.set("service", filters.service);
    if (filters.rating) params.set("rating", filters.rating);
    if (filters.source) params.set("source", filters.source);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    window.open(
      `/api/hire-shopify-experts/export?${params.toString()}`,
      "_blank"
    );
  };

  const handleDelete = async () => {
    if (!deleteLead) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/hire-shopify-experts/${deleteLead.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete lead");
      toast.success("Lead deleted successfully");
      setDeleteOpen(false);
      setDeleteLead(null);
      fetchLeads();
    } catch (err) {
      toast.error("Failed to delete lead");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetails = (lead: ShopifyExpertLead) => {
    setDetailLead(lead);
    setDetailOpen(true);
  };

  const handleDeleteClick = (lead: ShopifyExpertLead) => {
    setDeleteLead(lead);
    setDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            Hire Shopify Experts Leads
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and discover Shopify expert leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScrapeOpen(true)}
            className="border-primary text-primary hover:bg-primary/5"
          >
            <Play className="h-4 w-4 mr-1.5 fill-primary" />
            Scrape Shopify Experts
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Import CSV
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <Filters
            filters={filters}
            onChange={setFilters}
            onClear={() => {
              setFilters(emptyFilters);
              setPage(1);
            }}
          />
        </CardContent>
      </Card>

      {/* Results info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Loading..."
            : total === 0
              ? "No leads found"
              : `Showing ${(page - 1) * 25 + 1}\u2013${Math.min(page * 25, total)} of ${total} leads`}
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Loading leads...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && leads.length === 0 && (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-muted p-4">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No leads yet</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  Start by adding a lead manually or importing from a CSV
                  file. Your Shopify expert leads will appear here.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setScrapeOpen(true)}
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  <Play className="h-4 w-4 mr-1.5 fill-primary" />
                  Scrape Shopify Experts
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setImportOpen(true)}
                >
                  <Upload className="h-4 w-4 mr-1.5" />
                  Import CSV
                </Button>
                <Button onClick={() => setAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Lead
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data table */}
      {!loading && leads.length > 0 && (
        <DataTable
          leads={leads}
          onViewDetails={handleViewDetails}
          onDelete={handleDeleteClick}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <LeadDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        lead={detailLead}
      />
      <AddLeadModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={fetchLeads}
      />
      <ImportCsvModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={fetchLeads}
      />
      <ScrapeModal
        open={scrapeOpen}
        onOpenChange={setScrapeOpen}
        onSuccess={fetchLeads}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        leadName={deleteLead?.name || deleteLead?.website || ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}
