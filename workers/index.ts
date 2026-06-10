import { resolveQueueBackend } from "@/lib/jobs/queue-mode";

async function main() {
  const backend = await resolveQueueBackend();

  if (backend === "memory") {
    console.log(
      "[LeadStack] No Redis worker needed. Search and tech jobs run in-process when you use the app (npm run dev)."
    );
    console.log(
      "[LeadStack] Set REDIS_URL and run this worker in production for background job processing."
    );
    process.exit(0);
  }

  const { Worker } = await import("bullmq");
  const { default: IORedis } = await import("ioredis");
  const { processSearchJob } = await import("@/lib/jobs/process-search-job");
  const { processTechDetection } = await import("@/lib/jobs/process-tech-detection");

  const connection = new IORedis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
  });

  console.log("[LeadStack] Worker starting with Redis...");

  new Worker(
    "search-jobs",
    async (job) => {
      const { jobId } = job.data as { jobId: string };
      console.log(`Processing search job: ${jobId}`);
      await processSearchJob(jobId);
    },
    { connection, concurrency: 1 }
  );

  new Worker(
    "tech-detection",
    async (job) => {
      const { leadId } = job.data as { leadId: string };
      console.log(`Processing tech detection: ${leadId}`);
      await processTechDetection(leadId);
    },
    { connection, concurrency: 2 }
  );

  console.log("[LeadStack] Workers ready.");
}

main().catch((err) => {
  console.error("[LeadStack] Worker failed to start:", err);
  process.exit(1);
});
