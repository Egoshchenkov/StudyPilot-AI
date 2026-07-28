const dns = require("node:dns");
const mongoose = require("mongoose");

dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);

async function connectDatabase() {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log(
            "MongoDB connected successfully."
        );
    } catch (error) {
        console.error(
            "MongoDB connection failed:",
            error
        );

        process.exit(1);
    }
}

module.exports = connectDatabase;