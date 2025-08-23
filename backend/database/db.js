// database/db.js
const mongoose = require("mongoose");

async function connectWithRetry({ maxRetries = 5, initialDelayMs = 1000 } = {}) {
  const uri = (process.env.MONGODB_URI || "").trim();
  if (!uri) {
    console.error("❌ MONGODB_URI is not set. Add it to backend/.env");
    process.exit(1);
  }

  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt < maxRetries) {
    try {
      await mongoose.connect(uri);
      console.log("✅ MongoDB Connected");
      return;
    } catch (err) {
      attempt += 1;
      const canRetry = attempt < maxRetries;
      console.error(
        `❌ MongoDB connection attempt ${attempt} failed: ${err.message}${canRetry ? ` — retrying in ${Math.round(
          delay / 1000
        )}s...` : ""}`
      );
      if (!canRetry) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(delay * 2, 15000);
    }
  }
}

module.exports = async function connectDB() {
  try {
    await connectWithRetry();
  } catch (err) {
    console.error("❌ MongoDB Connection Failed after retries:", err.message);
    console.error(
      "Tip: Ensure your IP is allowed in Atlas Network Access, the URI is correct, and the database user has permissions."
    );
    process.exit(1);
  }
};
