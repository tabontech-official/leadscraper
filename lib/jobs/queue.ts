import {
  forceMemoryBackend,
  resolveQueueBackend,
} from "@/lib/jobs/queue-mode";
import {
  enqueueSearchJobMemory,
  enqueueTechDetectionMemory,
} from "@/lib/jobs/in-memory-queue";

type BullQueue = import("bullmq").Queue;

let redisSearchQueue: BullQueue | null = null;
let redisTechQueue: BullQueue | null = null;

async function getRedisConnection() {
  const { default: IORedis } = await import("ioredis");
  return new IORedis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
  });
}

async function getRedisSearchQueue(): Promise<BullQueue> {
  if (!redisSearchQueue) {
    const { Queue } = await import("bullmq");
    redisSearchQueue = new Queue("search-jobs", {
      connection: await getRedisConnection(),
    });
  }
  return redisSearchQueue;
}

async function getRedisTechQueue(): Promise<BullQueue> {
  if (!redisTechQueue) {
    const { Queue } = await import("bullmq");
    redisTechQueue = new Queue("tech-detection", {
      connection: await getRedisConnection(),
    });
  }
  return redisTechQueue;
}

export async function enqueueSearchJob(jobId: string) {
  const backend = await resolveQueueBackend();

  if (backend === "memory") {
    enqueueSearchJobMemory(jobId);
    return;
  }

  try {
    const queue = await getRedisSearchQueue();
    await queue.add(
      "process-search",
      { jobId },
      { attempts: 2, backoff: { type: "exponential", delay: 5000 } }
    );
  } catch (err) {
    forceMemoryBackend();
    console.error("[LeadStack] Redis enqueue failed, using in-memory:", err);
    enqueueSearchJobMemory(jobId);
  }
}

export async function enqueueTechDetection(leadId: string) {
  const backend = await resolveQueueBackend();

  if (backend === "memory") {
    enqueueTechDetectionMemory(leadId);
    return;
  }

  try {
    const queue = await getRedisTechQueue();
    await queue.add(
      "process-tech",
      { leadId },
      { attempts: 2, backoff: { type: "exponential", delay: 3000 } }
    );
  } catch (err) {
    forceMemoryBackend();
    console.error("[LeadStack] Redis enqueue failed, using in-memory:", err);
    enqueueTechDetectionMemory(leadId);
  }
}

/** Whether jobs run via BullMQ worker (Redis) or in-process (memory). */
export async function getQueueBackend() {
  return resolveQueueBackend();
}
