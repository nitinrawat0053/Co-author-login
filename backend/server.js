require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const connectDB = require("./database/db");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API routes
const authRoutes = require("./routes/authRoutes");
app.use("/api", authRoutes);

// Connect DB & start server only after DB is ready
(async () => {
    try {
        await connectDB();
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (err) {
        console.error("Server startup halted due to DB error.");
        process.exit(1);
    }
})();
