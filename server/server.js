// backend/server.js
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const frontendOrigin = process.env.FRONTEND_ORIGIN;

// Configure CORS with credentials support
app.use(cors({
    origin: frontendOrigin, 
    credentials: true
}));

app.use(express.json()); // For parsing application/json

app.use('/', userRoutes);

// Connect to MongoDB
connectDB().then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error("Database connection error:", err);
});