"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  Briefcase,
  Users,
  Download,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/upload", label: "Upload CSV", icon: Upload },
  { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/exports", label: "Exports", icon: Download },
  { href: "/dashboard/hire-shopify-experts", label: "Hire Shopify Experts", icon: ShoppingBag },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="border-b p-6">
        <Link href="/dashboard" className="text-xl font-bold text-primary">
          LeadStack Finder
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">
          Business leads + tech stack
        </p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          const active =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <UserButton afterSignOutUrl="/" />
      </div>
    </aside>
  );
}
