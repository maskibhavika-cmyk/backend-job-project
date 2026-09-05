const { createClient } = require("redis");

const redis = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379"
});

redis.on("error", (err) => {
    console.log("Redis Error:", err.message);
});

async function connectRedis() {
    try {
        await redis.connect();
        console.log("Redis connected");
    } catch (error) {
        console.log("Redis connection failed:", error.message);
    }
}

module.exports = {
    redis,
    connectRedis
};