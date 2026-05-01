import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

console.log('Notification worker starting...');

const worker = new Worker(
  'notifications',
  async (job: Job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    console.log('Job data:', job.data);
    
    // Stub for LINE Messaging API call
    // await lineClient.pushMessage(job.data.lineUserId, job.data.message);
    
    return { success: true, deliveredAt: new Date().toISOString() };
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} has failed with ${err.message}`);
});

process.on('SIGINT', async () => {
  console.log('Shutting down worker...');
  await worker.close();
  process.exit(0);
});
