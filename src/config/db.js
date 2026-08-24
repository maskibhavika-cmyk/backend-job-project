// const mongoose = require('mongoose')


const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]); // force reliable DNS resolution for SRV lookup


const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);

    console.log("Database connnected successfully");
  } catch (error) {
    console.log("DB connection Error:", error);
    process.exit(1);
  }
};

module.exports =  connectDB ;

