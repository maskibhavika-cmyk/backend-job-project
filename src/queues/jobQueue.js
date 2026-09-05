// const { Queue } = require("bullmq");
// const IORedis = require("ioredis");

// const redisConnection = new IORedis(
//     process.env.REDIS_URL || "redis://127.0.0.1:6379",
//     {
//         maxRetriesPerRequest: null
//     }
// );

// const jobQueue = new Queue("jobQueue", {
//     connection: redisConnection
// });

// module.exports = {
//     jobQueue,
//     redisConnection
// };

const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const redisConnection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null
});

const jobQueue = new Queue("jobQueue", {
    connection: redisConnection,

    defaultJobOptions: {
        attempts: 3,

        backoff: {
            type: "exponential",
            delay: 5000
        },

        removeOnComplete: true,
        removeOnFail: false
    }
});

module.exports = {
    jobQueue,
    redisConnection
};