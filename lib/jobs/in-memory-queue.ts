import { processSearchJob } from "@/lib/jobs/process-search-job";
import { processTechDetection } from "@/lib/jobs/process-tech-detection";
import { warnInMemoryFallback } from "@/lib/jobs/queue-mode";

const searchPending: string[] = [];
let searchDraining = false;

const techPending: string[] = [];
let techActive = 0;
const TECH_CONCURRENCY = 2;

export function enqueueSearchJobMemory(jobId: string) {
  warnInMemoryFallback();
  searchPending.push(jobId);
  void drainSearchQueue();
}

function drainSearchQueue() {
  if (searchDraining) return;
  searchDraining = true;

  void (async () => {
    while (searchPending.length > 0) {
      const id = searchPending.shift()!;
      try {
        await processSearchJob(id);
      } catch (err) {
        console.error("[LeadStack] In-memory search job failed:", id, err);
      }
    }
    searchDraining = false;
  })();
}

export function enqueueTechDetectionMemory(leadId: string) {
  warnInMemoryFallback();
  techPending.push(leadId);
  drainTechQueue();
}

function drainTechQueue() {
  while (techActive < TECH_CONCURRENCY && techPending.length > 0) {
    const id = techPending.shift()!;
    techActive++;
    processTechDetection(id)
      .catch((err) => {
        console.error("[LeadStack] In-memory tech job failed:", id, err);
      })
      .finally(() => {
        techActive--;
        drainTechQueue();
      });
  }
}
