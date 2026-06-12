"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Star, ExternalLink } from "lucide-react";

interface LeadData {
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

interface LeadDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: LeadData | null;
}

function DetailRow({
  label,
  value,
  isLink,
}: {
  label: string;
  value: string | null | undefined;
  isLink?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/50 last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="col-span-2 text-sm break-all">
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            {value}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          value
        )}
      </span>
    </div>
  );
}

export function LeadDetailModal({
  open,
  onOpenChange,
  lead,
}: LeadDetailModalProps) {
  if (!lead) return null;

  const socialLinks =
    lead.socialLinks && typeof lead.socialLinks === "object"
      ? lead.socialLinks
      : null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl max-h-[85vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
            <X className="h-4 w-4" />
          </Dialog.Close>

          <Dialog.Title className="text-lg font-semibold flex items-center gap-2">
            {lead.name || "Unnamed Expert"}
            {lead.status && (
              <Badge
                variant={lead.status === "active" ? "default" : "secondary"}
              >
                {lead.status}
              </Badge>
            )}
          </Dialog.Title>

          {lead.rating !== null && lead.rating !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{lead.rating}</span>
              </div>
              {lead.reviewsCount !== null && (
                <span className="text-sm text-muted-foreground">
                  ({lead.reviewsCount} reviews)
                </span>
              )}
            </div>
          )}

          <div className="mt-4 space-y-0">
            <DetailRow label="Website" value={lead.website} isLink />
            <DetailRow label="Profile URL" value={lead.profileUrl} isLink />
            <DetailRow label="Email" value={lead.email} />
            <DetailRow label="Phone" value={lead.phone} />
            <DetailRow label="Country" value={lead.country} />
            <DetailRow label="City" value={lead.city} />
            <DetailRow label="Services" value={lead.services} />
            <DetailRow label="Specialization" value={lead.specialization} />
            <DetailRow label="Category" value={lead.category} />
            <DetailRow label="Source URL" value={lead.sourceUrl} isLink />
            <DetailRow
              label="Date Scraped"
              value={
                lead.dateScraped
                  ? new Date(lead.dateScraped).toLocaleDateString()
                  : null
              }
            />
            <DetailRow
              label="Created"
              value={new Date(lead.createdAt).toLocaleString()}
            />
            <DetailRow
              label="Updated"
              value={new Date(lead.updatedAt).toLocaleString()}
            />
          </div>

          {lead.description && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Description
              </h4>
              <p className="text-sm whitespace-pre-wrap">{lead.description}</p>
            </div>
          )}

          {socialLinks && Object.keys(socialLinks).length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Social Links
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(socialLinks).map(([platform, url]) =>
                  url ? (
                    <a
                      key={platform}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {platform}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
