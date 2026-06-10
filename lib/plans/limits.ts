import type { Plan } from "@prisma/client";

export const PLAN_LIMITS = {
  FREE: {
    uploadsPerMonth: 1,
    maxRowsPerCsv: 100,
    maxResultsPerRow: 10,
    maxLeads: 500,
  },
  PRO: {
    uploadsPerMonth: 10,
    maxRowsPerCsv: 5000,
    maxResultsPerRow: 20,
    maxLeads: 50000,
  },
  AGENCY: {
    uploadsPerMonth: 999,
    maxRowsPerCsv: 50000,
    maxResultsPerRow: 50,
    maxLeads: 500000,
  },
} as const;

export function getPlanLimits(plan: Plan) {
  return PLAN_LIMITS[plan];
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
