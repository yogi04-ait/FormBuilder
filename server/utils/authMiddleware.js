const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({ message: "No token provided. Access denied." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "User not found. Access denied." });
        }
        req.user = { id: user._id, email: user.email };
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Invalid or expired token. Access denied." });
    }
};

module.exports = authMiddleware;
