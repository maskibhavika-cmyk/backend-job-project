
const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();
require("./src/workers/jobWorker");
require("./src/workers/emailWorker");
const app = require("./src/app");

const connectDB = require("./src/config/db");

const { connectRedis } = require("./src/config/redis");

connectDB();

connectRedis();

app.listen(8080, () => {
    console.log("Server running on port 8080");
});