"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Copy,
  ExternalLink,
  Trash2,
  Star,
  MoreHorizontal,
  ArrowUpDown,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";

export interface ShopifyExpertLead {
  id: string;
  name: string | null;
  website: string | null;
  profileUrl: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  services: string | null;
  specialization: string | null;
  rating: number | null;
  reviewsCount: number | null;
  socialLinks: any;
  sourceUrl: string | null;
  description: string | null;
  category: string | null;
  status: string | null;
  dateScraped: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DataTableProps {
  leads: ShopifyExpertLead[];
  onViewDetails: (lead: ShopifyExpertLead) => void;
  onDelete: (lead: ShopifyExpertLead) => void;
  sortBy: string;
  sortOrder: string;
  onSort: (field: string) => void;
}

function SortableHeader({
  field,
  label,
  sortBy,
  sortOrder,
  onSort,
}: {
  field: string;
  label: string;
  sortBy: string;
  sortOrder: string;
  onSort: (f: string) => void;
}) {
  return (
    <TableHead>
      <button
        className="flex items-center gap-1 hover:text-foreground transition-colors"
        onClick={() => onSort(field)}
      >
        {label}
        <ArrowUpDown
          className={`h-3.5 w-3.5 ${
            sortBy === field
              ? "text-primary"
              : "text-muted-foreground/50"
          }`}
        />
      </button>
    </TableHead>
  );
}

export function DataTable({
  leads,
  onViewDetails,
  onDelete,
  sortBy,
  sortOrder,
  onSort,
}: DataTableProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(`${label} copied to clipboard`);
      })
      .catch(() => {
        toast.error("Failed to copy");
      });
  };

  if (leads.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader
              field="name"
              label="Name"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <TableHead>Website</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <SortableHeader
              field="country"
              label="Country"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <TableHead>Services</TableHead>
            <SortableHeader
              field="rating"
              label="Rating"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <TableHead>Source</TableHead>
            <SortableHeader
              field="dateScraped"
              label="Date Scraped"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium max-w-[180px]">
                <span
                  className="truncate block"
                  title={lead.name ?? undefined}
                >
                  {lead.name || "\u2014"}
                </span>
              </TableCell>
              <TableCell className="max-w-[160px]">
                {lead.website ? (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate block text-sm"
                    title={lead.website}
                  >
                    {lead.website
                      .replace(/^https?:\/\//, "")
                      .replace(/\/$/, "")}
                  </a>
                ) : (
                  "\u2014"
                )}
              </TableCell>
              <TableCell className="max-w-[180px]">
                <span
                  className="truncate block text-sm"
                  title={lead.email ?? undefined}
                >
                  {lead.email || "\u2014"}
                </span>
              </TableCell>
              <TableCell className="text-sm">
                {lead.phone || "\u2014"}
              </TableCell>
              <TableCell className="text-sm">
                {lead.country || "\u2014"}
              </TableCell>
              <TableCell className="max-w-[160px]">
                <span
                  className="truncate block text-sm"
                  title={lead.services ?? undefined}
                >
                  {lead.services || "\u2014"}
                </span>
              </TableCell>
              <TableCell>
                {lead.rating !== null && lead.rating !== undefined ? (
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{lead.rating}</span>
                  </div>
                ) : (
                  "\u2014"
                )}
              </TableCell>
              <TableCell className="max-w-[120px]">
                <span
                  className="truncate block text-sm"
                  title={lead.sourceUrl ?? undefined}
                >
                  {lead.sourceUrl
                    ? (() => {
                        try {
                          return new URL(lead.sourceUrl).hostname.replace(
                            /^www\./,
                            ""
                          );
                        } catch {
                          return lead.sourceUrl;
                        }
                      })()
                    : "\u2014"}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {lead.dateScraped
                  ? new Date(lead.dateScraped).toLocaleDateString()
                  : "\u2014"}
              </TableCell>
              <TableCell>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="z-50 min-w-[160px] rounded-md border bg-card p-1 shadow-md animate-in fade-in-0 zoom-in-95"
                      align="end"
                    >
                      <DropdownMenu.Item
                        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer outline-none hover:bg-muted transition-colors"
                        onSelect={() => onViewDetails(lead)}
                      >
                        <Eye className="h-3.5 w-3.5" /> View details
                      </DropdownMenu.Item>
                      {lead.email && (
                        <DropdownMenu.Item
                          className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer outline-none hover:bg-muted transition-colors"
                          onSelect={() =>
                            copyToClipboard(lead.email!, "Email")
                          }
                        >
                          <Copy className="h-3.5 w-3.5" /> Copy email
                        </DropdownMenu.Item>
                      )}
                      {lead.phone && (
                        <DropdownMenu.Item
                          className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer outline-none hover:bg-muted transition-colors"
                          onSelect={() =>
                            copyToClipboard(lead.phone!, "Phone")
                          }
                        >
                          <Copy className="h-3.5 w-3.5" /> Copy phone
                        </DropdownMenu.Item>
                      )}
                      {lead.website && (
                        <DropdownMenu.Item
                          className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer outline-none hover:bg-muted transition-colors"
                          onSelect={() =>
                            window.open(lead.website!, "_blank")
                          }
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Visit
                          website
                        </DropdownMenu.Item>
                      )}
                      <DropdownMenu.Separator className="my-1 h-px bg-border" />
                      <DropdownMenu.Item
                        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer outline-none hover:bg-destructive/10 text-destructive transition-colors"
                        onSelect={() => onDelete(lead)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete lead
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
