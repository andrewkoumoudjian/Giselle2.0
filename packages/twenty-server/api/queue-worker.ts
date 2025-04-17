// Vercel Serverless Function to process BullMQ jobs on-demand
import { NextApiRequest, NextApiResponse } from 'next';
import { Worker, Queue } from 'bullmq';

// Import your job handlers here
// import { processJob } from '../src/engine/core-modules/message-queue/jobs/your-job-file';

const redisConnection = {
  connection: {
    url: process.env.REDIS_URL,
  },
};

// Example queue name, adjust as needed
const QUEUE_NAME = 'default';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This function can be triggered by Vercel Cron or manually
  try {
    // Instantiate the worker for the queue
    const worker = new Worker(
      QUEUE_NAME,
      async (job) => {
        // Place your job processing logic here
        // await processJob(job);
        console.log('Processing job:', job.id, job.name, job.data);
      },
      redisConnection
    );

    // Wait for all waiting jobs to be processed (timeout after 25s for Vercel)
    await new Promise((resolve) => setTimeout(resolve, 25000));
    await worker.close();
    res.status(200).json({ status: 'Processed jobs for 25s window.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
