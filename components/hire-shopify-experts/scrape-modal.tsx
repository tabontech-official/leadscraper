"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { X, Globe, List, Play, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const SHOPIFY_LOCATION_SOURCES = [
  { key: "canada", name: "Canada", url: "https://www.shopify.com/partners/directory/locations/canada" },
  { key: "united-states", name: "United States", url: "https://www.shopify.com/partners/directory/locations/united-states" },
  { key: "mexico", name: "Mexico", url: "https://www.shopify.com/partners/directory/locations/mexico" },
  { key: "australia", name: "Australia", url: "https://www.shopify.com/partners/directory/locations/australia" },
  { key: "new-zealand", name: "New Zealand", url: "https://www.shopify.com/partners/directory/locations/new-zealand" },
  { key: "united-kingdom", name: "United Kingdom", url: "https://www.shopify.com/partners/directory/locations/united-kingdom" },
  { key: "belgium", name: "Belgium", url: "https://www.shopify.com/partners/directory/locations/belgium" },
  { key: "france", name: "France", url: "https://www.shopify.com/partners/directory/locations/france" },
  { key: "germany", name: "Germany", url: "https://www.shopify.com/partners/directory/locations/germany" },
  { key: "spain", name: "Spain", url: "https://www.shopify.com/partners/directory/locations/spain" },
  { key: "portugal", name: "Portugal", url: "https://www.shopify.com/partners/directory/locations/portugal" },
  { key: "denmark", name: "Denmark", url: "https://www.shopify.com/partners/directory/locations/denmark" },
  { key: "ireland", name: "Ireland", url: "https://www.shopify.com/partners/directory/locations/ireland" },
  { key: "switzerland", name: "Switzerland", url: "https://www.shopify.com/partners/directory/locations/switzerland" },
  { key: "italy", name: "Italy", url: "https://www.shopify.com/partners/directory/locations/italy" },
  { key: "latvia", name: "Latvia", url: "https://www.shopify.com/partners/directory/locations/latvia" },
  { key: "lithuania", name: "Lithuania", url: "https://www.shopify.com/partners/directory/locations/lithuania" },
  { key: "romania", name: "Romania", url: "https://www.shopify.com/partners/directory/locations/romania" },
  { key: "ukraine", name: "Ukraine", url: "https://www.shopify.com/partners/directory/locations/ukraine" },
  { key: "netherlands", name: "Netherlands", url: "https://www.shopify.com/partners/directory/locations/netherlands" },
  { key: "sweden", name: "Sweden", url: "https://www.shopify.com/partners/directory/locations/sweden" },
  { key: "slovakia", name: "Slovakia", url: "https://www.shopify.com/partners/directory/locations/slovakia" },
  { key: "czechia", name: "Czechia", url: "https://www.shopify.com/partners/directory/locations/czechia" },
  { key: "finland", name: "Finland", url: "https://www.shopify.com/partners/directory/locations/finland" },
  { key: "bulgaria", name: "Bulgaria", url: "https://www.shopify.com/partners/directory/locations/bulgaria" },
  { key: "poland", name: "Poland", url: "https://www.shopify.com/partners/directory/locations/poland" },
  { key: "turkiye", name: "Türkiye", url: "https://www.shopify.com/partners/directory/locations/turkiye" },
  { key: "estonia", name: "Estonia", url: "https://www.shopify.com/partners/directory/locations/estonia" },
  { key: "cyprus", name: "Cyprus", url: "https://www.shopify.com/partners/directory/locations/cyprus" },
  { key: "greece", name: "Greece", url: "https://www.shopify.com/partners/directory/locations/greece" },
  { key: "serbia", name: "Serbia", url: "https://www.shopify.com/partners/directory/locations/serbia" },
  { key: "austria", name: "Austria", url: "https://www.shopify.com/partners/directory/locations/austria" },
  { key: "croatia", name: "Croatia", url: "https://www.shopify.com/partners/directory/locations/croatia" },
  { key: "hungary", name: "Hungary", url: "https://www.shopify.com/partners/directory/locations/hungary" },
  { key: "georgia", name: "Georgia", url: "https://www.shopify.com/partners/directory/locations/georgia" },
  { key: "bosnia-herzegovina", name: "Bosnia & Herzegovina", url: "https://www.shopify.com/partners/directory/locations/bosnia-herzegovina" },
  { key: "norway", name: "Norway", url: "https://www.shopify.com/partners/directory/locations/norway" },
  { key: "singapore", name: "Singapore", url: "https://www.shopify.com/partners/directory/locations/singapore" },
  { key: "hong-kong-sar", name: "Hong Kong SAR", url: "https://www.shopify.com/partners/directory/locations/hong-kong-sar" },
  { key: "thailand", name: "Thailand", url: "https://www.shopify.com/partners/directory/locations/thailand" },
  { key: "india", name: "India", url: "https://www.shopify.com/partners/directory/locations/india" },
  { key: "indonesia", name: "Indonesia", url: "https://www.shopify.com/partners/directory/locations/indonesia" },
  { key: "japan", name: "Japan", url: "https://www.shopify.com/partners/directory/locations/japan" },
  { key: "pakistan", name: "Pakistan", url: "https://www.shopify.com/partners/directory/locations/pakistan" },
  { key: "israel", name: "Israel", url: "https://www.shopify.com/partners/directory/locations/israel" },
  { key: "russia", name: "Russia", url: "https://www.shopify.com/partners/directory/locations/russia" },
  { key: "united-arab-emirates", name: "United Arab Emirates", url: "https://www.shopify.com/partners/directory/locations/united-arab-emirates" },
  { key: "vietnam", name: "Vietnam", url: "https://www.shopify.com/partners/directory/locations/vietnam" },
  { key: "malaysia", name: "Malaysia", url: "https://www.shopify.com/partners/directory/locations/malaysia" },
  { key: "bangladesh", name: "Bangladesh", url: "https://www.shopify.com/partners/directory/locations/bangladesh" },
  { key: "sri-lanka", name: "Sri Lanka", url: "https://www.shopify.com/partners/directory/locations/sri-lanka" },
  { key: "china", name: "China", url: "https://www.shopify.com/partners/directory/locations/china" },
  { key: "nepal", name: "Nepal", url: "https://www.shopify.com/partners/directory/locations/nepal" },
  { key: "lebanon", name: "Lebanon", url: "https://www.shopify.com/partners/directory/locations/lebanon" },
  { key: "philippines", name: "Philippines", url: "https://www.shopify.com/partners/directory/locations/philippines" },
  { key: "south-korea", name: "South Korea", url: "https://www.shopify.com/partners/directory/locations/south-korea" },
  { key: "taiwan", name: "Taiwan", url: "https://www.shopify.com/partners/directory/locations/taiwan" },
  { key: "kuwait", name: "Kuwait", url: "https://www.shopify.com/partners/directory/locations/kuwait" },
  { key: "south-africa", name: "South Africa", url: "https://www.shopify.com/partners/directory/locations/south-africa" },
  { key: "nigeria", name: "Nigeria", url: "https://www.shopify.com/partners/directory/locations/nigeria" },
  { key: "egypt", name: "Egypt", url: "https://www.shopify.com/partners/directory/locations/egypt" },
  { key: "morocco", name: "Morocco", url: "https://www.shopify.com/partners/directory/locations/morocco" },
  { key: "mauritius", name: "Mauritius", url: "https://www.shopify.com/partners/directory/locations/mauritius" },
  { key: "argentina", name: "Argentina", url: "https://www.shopify.com/partners/directory/locations/argentina" },
  { key: "chile", name: "Chile", url: "https://www.shopify.com/partners/directory/locations/chile" },
  { key: "brazil", name: "Brazil", url: "https://www.shopify.com/partners/directory/locations/brazil" },
  { key: "colombia", name: "Colombia", url: "https://www.shopify.com/partners/directory/locations/colombia" },
  { key: "peru", name: "Peru", url: "https://www.shopify.com/partners/directory/locations/peru" },
  { key: "uruguay", name: "Uruguay", url: "https://www.shopify.com/partners/directory/locations/uruguay" },
  { key: "panama", name: "Panama", url: "https://www.shopify.com/partners/directory/locations/panama" },
  { key: "guatemala", name: "Guatemala", url: "https://www.shopify.com/partners/directory/locations/guatemala" },
] as const;

const DEFAULT_SELECTED_COUNTRIES = SHOPIFY_LOCATION_SOURCES.map((source) => source.key);


interface ScrapeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ScrapeModal({
  open,
  onOpenChange,
  onSuccess,
}: ScrapeModalProps) {
  const [mode, setMode] = useState<"default" | "custom">("default");
  const [customUrlsText, setCustomUrlsText] = useState("");
  const [scraping, setScraping] = useState(false);
  const [limit, setLimit] = useState<number>(40);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([...DEFAULT_SELECTED_COUNTRIES]);
  const [continueFromLast, setContinueFromLast] = useState(true);

  const [result, setResult] = useState<{
    success: boolean;
    totalSourcesChecked: number;
    totalLeadsFound: number;
    newLeadsSaved: number;
    duplicatesSkipped: number;
    failedSources: number;
    errors: string[];
  } | null>(null);

  const reset = () => {
    setMode("default");
    setCustomUrlsText("");
    setScraping(false);
    setResult(null);
    setLimit(40);
    setSelectedCountries([...DEFAULT_SELECTED_COUNTRIES]);
    setContinueFromLast(true);
  };

  const handleStartScrape = async () => {
    setScraping(true);
    setResult(null);

    const payload: any = {
      limit,
      continueFromLast,
    };

    if (mode === "custom") {
      const urls = customUrlsText
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url !== "");
      
      if (urls.length === 0) {
        toast.error("Please paste at least one Shopify expert profile URL");
        setScraping(false);
        return;
      }
      payload.urls = urls;
    } else {
      if (selectedCountries.length === 0) {
        toast.error("Please select at least one country to scrape");
        setScraping(false);
        return;
      }
      payload.selectedSources = SHOPIFY_LOCATION_SOURCES
        .filter((source) => selectedCountries.includes(source.key))
        .map((source) => source.url);
    }

    try {
      const response = await fetch("/api/hire-shopify-experts/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Scraping failed");
      }

      setResult(data);
      if (data.newLeadsSaved > 0) {
        toast.success(`Scraping complete: Saved ${data.newLeadsSaved} new Shopify Expert leads!`);
        onSuccess();
      } else {
        toast.info("Scraping complete: No new leads found (all entries were duplicates or already scraped).");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to execute scraper");
    } finally {
      setScraping(false);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!scraping) {
          onOpenChange(v);
          if (!v) reset();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
            <X className="h-4 w-4" />
          </Dialog.Close>
          
          <Dialog.Title className="text-lg font-semibold">
            Scrape Shopify Experts
          </Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mt-1">
            Automatically discover and extract real Shopify expert/developer/agency leads from official directories.
          </Dialog.Description>

          {!scraping && !result ? (
            <div className="mt-4 space-y-5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("default")}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border text-center gap-2 transition-all ${
                    mode === "default"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-muted hover:bg-muted/50"
                  }`}
                >
                  <Globe className="h-6 w-6" />
                  <div>
                    <p className="text-sm font-medium">Default Directories</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Scrape top locations in directory</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("custom")}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border text-center gap-2 transition-all ${
                    mode === "custom"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-muted hover:bg-muted/50"
                  }`}
                >
                  <List className="h-6 w-6" />
                  <div>
                    <p className="text-sm font-medium">Custom URLs</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Paste specific profile links</p>
                  </div>
                </button>
              </div>

              {mode === "default" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-sm font-medium">Select Countries to Scrape:</label>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCountries((prev) =>
                          prev.length === SHOPIFY_LOCATION_SOURCES.length ? [] : [...DEFAULT_SELECTED_COUNTRIES]
                        );
                      }}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {selectedCountries.length === SHOPIFY_LOCATION_SOURCES.length ? "Unselect all" : "Select all"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border rounded-md p-3 bg-muted/30 max-h-72 overflow-y-auto">
                    {SHOPIFY_LOCATION_SOURCES.map((country) => (
                      <label key={country.key} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCountries.includes(country.key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCountries(prev => [...prev, country.key]);
                            } else {
                              setSelectedCountries(prev => prev.filter(c => c !== country.key));
                            }
                          }}
                          className="rounded border-muted bg-transparent text-primary focus:ring-primary"
                        />
                        {country.name}
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor="custom-urls" className="text-sm font-medium">
                    Profile URLs (one per line):
                  </label>
                  <textarea
                    id="custom-urls"
                    rows={4}
                    placeholder="https://www.shopify.com/partners/directory/partner/it-geeks&#10;https://www.shopify.com/partners/directory/partner/tracy-sailors"
                    value={customUrlsText}
                    onChange={(e) => setCustomUrlsText(e.target.value)}
                    className="w-full text-xs font-mono p-2 border rounded-md bg-transparent focus-visible:outline-primary outline-1"
                  />
                </div>
              )}

              {/* Job Settings Section */}
              <div className="border-t pt-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scraper Settings</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="profiles-limit" className="text-xs font-medium">Profiles per run:</label>
                    <select
                      id="profiles-limit"
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="w-full text-xs p-2 border rounded-md bg-transparent dark:bg-zinc-900 focus-visible:outline-primary outline-1"
                    >
                      <option value={40}>40 profiles</option>
                      <option value={100}>100 profiles</option>
                      <option value={200}>200 profiles</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={continueFromLast}
                        onChange={(e) => setContinueFromLast(e.target.checked)}
                        className="rounded border-muted bg-transparent text-primary focus:ring-primary"
                      />
                      Continue from last position
                    </label>
                  </div>
                </div>
                
                <p className="text-[10px] text-muted-foreground italic leading-normal">
                  * Enabling &quot;Continue from last position&quot; excludes previously collected profiles to scrape next batch.
                </p>
              </div>
            </div>
          ) : scraping ? (
            <div className="mt-8 flex flex-col items-center justify-center py-6 text-center space-y-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Running Scraper Engine...</p>
                <p className="text-xs text-muted-foreground max-w-xs leading-normal">
                  Fetching public Shopify Experts listings, parsing contact information, and applying database deduplication. This can take up to 30-45 seconds.
                </p>
              </div>
            </div>
          ) : (
            result && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Scraping Completed Successfully!</p>
                    <p className="text-xs">Database sync and updates finished.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border p-3 bg-muted/20">
                    <p className="text-xs text-muted-foreground">Sources Checked</p>
                    <p className="text-lg font-bold">{result.totalSourcesChecked}</p>
                  </div>
                  <div className="rounded-lg border p-3 bg-muted/20">
                    <p className="text-xs text-muted-foreground">Total Leads Found</p>
                    <p className="text-lg font-bold">{result.totalLeadsFound}</p>
                  </div>
                  <div className="rounded-lg border p-3 bg-muted/20">
                    <p className="text-xs text-muted-foreground">New Saved Leads</p>
                    <p className="text-lg font-bold text-green-600">{result.newLeadsSaved}</p>
                  </div>
                  <div className="rounded-lg border p-3 bg-muted/20">
                    <p className="text-xs text-muted-foreground">Duplicates/Skipped</p>
                    <p className="text-lg font-bold text-amber-600">{result.duplicatesSkipped}</p>
                  </div>
                </div>

                {result.failedSources > 0 && (
                  <div className="flex items-start gap-1.5 text-xs text-destructive bg-destructive/5 border border-destructive/20 p-2.5 rounded-lg">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>
                      Failed to contact <strong>{result.failedSources}</strong> source URLs. They may be temporarily offline or blocking requests.
                    </p>
                  </div>
                )}

                {result.errors.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground">Error Details (first 5):</p>
                    <div className="max-h-24 overflow-y-auto rounded-md border bg-muted/50 p-2 font-mono text-[10px] text-muted-foreground space-y-1">
                      {result.errors.slice(0, 5).map((err, i) => (
                        <p key={i} className="truncate">&bull; {err}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
              disabled={scraping}
            >
              {result ? "Close" : "Cancel"}
            </Button>
            {!scraping && !result && (
              <Button onClick={handleStartScrape} className="gap-2">
                <Play className="h-3.5 w-3.5" />
                Start Scraping
              </Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
