import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Exports</h1>
        <p className="text-muted-foreground">
          Export your leads as CSV from the leads page
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Export leads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Go to the Leads page to apply filters and export filtered or
            selected leads as CSV. Export includes business details, contact
            info, social links, and tech stack data.
          </p>
          <Link href="/dashboard/leads">
            <Button>Go to Leads</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
