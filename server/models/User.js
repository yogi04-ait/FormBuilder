const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.']
    },
    workspaces: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace"
    }]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
