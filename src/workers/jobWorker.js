require("dotenv").config();

const { Worker } = require("bullmq");
const IORedis = require("ioredis");

const redisConnection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null
});

const jobWorker = new Worker(
    "jobQueue",

    async (job) => {

        console.log("--------------------------------");
        console.log("Job received from queue");
        console.log("Job ID:", job.id);
        console.log("Job Name:", job.name);
        console.log("Job Data:", job.data);

        console.log(
            `Attempt: ${job.attemptsMade + 1}`
        );

        console.log("Processing job...");

        // RETRY TEST
        throw new Error("Testing retry mechanism");

    },

    {
        connection: redisConnection
    }
);


jobWorker.on("completed", (job) => {

    console.log(
        `Queue job ${job.id} completed`
    );

});


jobWorker.on("failed", (job, error) => {

    console.log("--------------------------------");

    console.log(
        `Queue job ${job?.id} failed`
    );

    console.log(
        "Attempt:",
        job?.attemptsMade
    );

    console.log(
        "Error:",
        error.message
    );

    console.log("--------------------------------");

});


console.log("Job worker started");