"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  totalLeads: number;
  shopifySites: number;
  wordpressSites: number;
  wooCommerceSites: number;
  leadsWithEmail: number;
  leadsWithPhone: number;
  completedJobs: number;
  runningJobs: number;
}

export function StatCards() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const cards = [
    { title: "Total leads", value: stats?.totalLeads ?? "—" },
    { title: "Shopify sites", value: stats?.shopifySites ?? "—" },
    { title: "WordPress sites", value: stats?.wordpressSites ?? "—" },
    { title: "WooCommerce sites", value: stats?.wooCommerceSites ?? "—" },
    { title: "Leads with email", value: stats?.leadsWithEmail ?? "—" },
    { title: "Leads with phone", value: stats?.leadsWithPhone ?? "—" },
    { title: "Completed jobs", value: stats?.completedJobs ?? "—" },
    { title: "Running jobs", value: stats?.runningJobs ?? "—" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
