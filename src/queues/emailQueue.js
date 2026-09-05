// const { Queue } = require("bullmq");
// const IORedis = require("ioredis");

// const emailRedisConnection = new IORedis(
//     process.env.REDIS_URL || "redis://127.0.0.1:6379",
//     {
//         maxRetriesPerRequest: null
//     }
// );

// const emailQueue = new Queue("emailQueue", {
//     connection: emailRedisConnection
// });

// module.exports = {
//     emailQueue,
//     emailRedisConnection
// };
const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const redisConnection = new IORedis(
    process.env.REDIS_URL || "redis://127.0.0.1:6379",
    {
        maxRetriesPerRequest: null
    }
);

const emailQueue = new Queue("emailQueue", {
    connection: redisConnection
});

module.exports = {
    emailQueue
};