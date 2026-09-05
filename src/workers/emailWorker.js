require("dotenv").config();

const { Worker } = require("bullmq");
const IORedis = require("ioredis");

const redisConnection = new IORedis(
    process.env.REDIS_URL || "redis://127.0.0.1:6379",
    {
        maxRetriesPerRequest: null
    }
);

const emailWorker = new Worker(
    "emailQueue",

    async (job) => {

        console.log("==============================");
        console.log("EMAIL WORKER PROCESSING");

        console.log("Job ID:", job.id);
        console.log("Job Name:", job.name);
        console.log("Email Data:", job.data);

        console.log(
            `Email processing for ${job.data.company}`
        );

        console.log("Email background processing completed");

        console.log("==============================");

        return {
            success: true
        };
    },

    {
        connection: redisConnection
    }
);

emailWorker.on("completed", (job) => {
    console.log(`Email Queue Completed: ${job.id}`);
});

emailWorker.on("failed", (job, error) => {
    console.log(`Email Queue Failed: ${job?.id}`);
    console.log("Error:", error.message);
});

console.log("Email worker started");