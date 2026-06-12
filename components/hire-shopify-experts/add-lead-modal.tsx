"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { toast } from "sonner";

interface AddLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const initialForm = {
  name: "",
  website: "",
  profileUrl: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  services: "",
  specialization: "",
  rating: "",
  reviewsCount: "",
  sourceUrl: "",
  description: "",
  category: "",
};

export function AddLeadModal({
  open,
  onOpenChange,
  onSuccess,
}: AddLeadModalProps) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim() && !form.website.trim() && !form.profileUrl.trim()) {
      errs.name =
        "At least one of Name, Website, or Profile URL is required";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Invalid email address";
    }
    if (form.website && !/^https?:\/\/.+/.test(form.website)) {
      errs.website = "Website must start with http:// or https://";
    }
    if (form.profileUrl && !/^https?:\/\/.+/.test(form.profileUrl)) {
      errs.profileUrl = "Profile URL must start with http:// or https://";
    }
    if (
      form.rating &&
      (isNaN(Number(form.rating)) ||
        Number(form.rating) < 0 ||
        Number(form.rating) > 5)
    ) {
      errs.rating = "Rating must be a number between 0 and 5";
    }
    if (
      form.reviewsCount &&
      (isNaN(Number(form.reviewsCount)) || Number(form.reviewsCount) < 0)
    ) {
      errs.reviewsCount = "Reviews count must be a positive number";
    }
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {};
      if (form.name.trim()) payload.name = form.name.trim();
      if (form.website.trim()) payload.website = form.website.trim();
      if (form.profileUrl.trim()) payload.profileUrl = form.profileUrl.trim();
      if (form.email.trim()) payload.email = form.email.trim();
      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (form.country.trim()) payload.country = form.country.trim();
      if (form.city.trim()) payload.city = form.city.trim();
      if (form.services.trim()) payload.services = form.services.trim();
      if (form.specialization.trim())
        payload.specialization = form.specialization.trim();
      if (form.rating) payload.rating = Number(form.rating);
      if (form.reviewsCount) payload.reviewsCount = Number(form.reviewsCount);
      if (form.sourceUrl.trim()) payload.sourceUrl = form.sourceUrl.trim();
      if (form.description.trim())
        payload.description = form.description.trim();
      if (form.category.trim()) payload.category = form.category.trim();

      const res = await fetch("/api/hire-shopify-experts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add lead");
      }
      toast.success("Lead added successfully");
      setForm(initialForm);
      setErrors({});
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to add lead");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!submitting) {
          onOpenChange(v);
          if (!v) {
            setForm(initialForm);
            setErrors({});
          }
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
            Add New Lead
          </Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mt-1">
            Add a Shopify expert lead manually. At least one of Name, Website,
            or Profile URL is required.
          </Dialog.Description>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-name">Name</Label>
              <Input
                id="add-name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Expert / Business name"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-website">Website</Label>
              <Input
                id="add-website"
                value={form.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://example.com"
              />
              {errors.website && (
                <p className="text-xs text-destructive">{errors.website}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-profileUrl">Profile URL</Label>
              <Input
                id="add-profileUrl"
                value={form.profileUrl}
                onChange={(e) => handleChange("profileUrl", e.target.value)}
                placeholder="https://experts.shopify.com/..."
              />
              {errors.profileUrl && (
                <p className="text-xs text-destructive">{errors.profileUrl}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-phone">Phone</Label>
              <Input
                id="add-phone"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-country">Country</Label>
              <Input
                id="add-country"
                value={form.country}
                onChange={(e) => handleChange("country", e.target.value)}
                placeholder="United States"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-city">City</Label>
              <Input
                id="add-city"
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="New York"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-services">Services</Label>
              <Input
                id="add-services"
                value={form.services}
                onChange={(e) => handleChange("services", e.target.value)}
                placeholder="Store setup, Theme development"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-specialization">Specialization</Label>
              <Input
                id="add-specialization"
                value={form.specialization}
                onChange={(e) => handleChange("specialization", e.target.value)}
                placeholder="Shopify Plus, Custom apps"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-rating">Rating (0-5)</Label>
              <Input
                id="add-rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.rating}
                onChange={(e) => handleChange("rating", e.target.value)}
                placeholder="4.5"
              />
              {errors.rating && (
                <p className="text-xs text-destructive">{errors.rating}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-reviewsCount">Reviews Count</Label>
              <Input
                id="add-reviewsCount"
                type="number"
                min="0"
                value={form.reviewsCount}
                onChange={(e) => handleChange("reviewsCount", e.target.value)}
                placeholder="42"
              />
              {errors.reviewsCount && (
                <p className="text-xs text-destructive">
                  {errors.reviewsCount}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-category">Category</Label>
              <Input
                id="add-category"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                placeholder="Agency, Freelancer"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="add-sourceUrl">Source URL</Label>
              <Input
                id="add-sourceUrl"
                value={form.sourceUrl}
                onChange={(e) => handleChange("sourceUrl", e.target.value)}
                placeholder="https://experts.shopify.com"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="add-description">Description</Label>
              <textarea
                id="add-description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Brief description or bio..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setForm(initialForm);
                setErrors({});
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Adding..." : "Add Lead"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
