"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export interface FilterValues {
  search: string;
  country: string;
  service: string;
  rating: string;
  source: string;
  dateFrom: string;
  dateTo: string;
}

interface FiltersProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  onClear: () => void;
}

export const emptyFilters: FilterValues = {
  search: "",
  country: "",
  service: "",
  rating: "",
  source: "",
  dateFrom: "",
  dateTo: "",
};

export function Filters({ filters, onChange, onClear }: FiltersProps) {
  const update = (field: keyof FilterValues, value: string) => {
    onChange({ ...filters, [field]: value });
  };

  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, website, email, or phone..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className="pl-9"
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="gap-1">
            <X className="h-3.5 w-3.5" />
            Clear filters
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Country"
          value={filters.country}
          onChange={(e) => update("country", e.target.value)}
          className="w-[150px]"
        />
        <Input
          placeholder="Service type"
          value={filters.service}
          onChange={(e) => update("service", e.target.value)}
          className="w-[150px]"
        />
        <select
          value={filters.rating}
          onChange={(e) => update("rating", e.target.value)}
          className="h-10 w-[130px] rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Any rating</option>
          <option value="4">4+ stars</option>
          <option value="3">3+ stars</option>
          <option value="2">2+ stars</option>
          <option value="1">1+ stars</option>
        </select>
        <Input
          placeholder="Source"
          value={filters.source}
          onChange={(e) => update("source", e.target.value)}
          className="w-[150px]"
        />
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update("dateFrom", e.target.value)}
            className="w-[140px]"
            title="From date"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => update("dateTo", e.target.value)}
            className="w-[140px]"
            title="To date"
          />
        </div>
      </div>
    </div>
  );
}
