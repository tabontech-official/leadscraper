import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Search,
  Globe,
  Download,
  Zap,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-xl font-bold text-primary">LeadStack Finder</span>
          <div className="flex gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost">Log in</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>Sign up</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Find local business leads & detect their tech stack
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Upload a CSV of zip codes and categories. We search compliant
            business APIs, enrich websites, detect Shopify, WordPress, and more —
            then export qualified leads.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg">Get started free</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard/upload">
                <Button size="lg">Upload CSV</Button>
              </Link>
            </SignedIn>
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Search,
              title: "Compliant search",
              desc: "SerpAPI & Google Places — no scraping Google HTML",
            },
            {
              icon: Globe,
              title: "Website enrichment",
              desc: "Emails, phones, socials from business sites",
            },
            {
              icon: Zap,
              title: "Tech detection",
              desc: "Shopify, WordPress, WooCommerce, Wix & more",
            },
            {
              icon: Download,
              title: "CSV export",
              desc: "Filter leads and export to your CRM",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <f.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
