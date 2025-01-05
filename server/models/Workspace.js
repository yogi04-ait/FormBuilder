const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        type: { type: String, required: true, enum: ["shared", "personal"] },
        owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
        sharedWith: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                mode: { type: String, enum: ["edit", "view"], required: true },
            },
        ],
        sharedLink: {
            mode: { type: String, enum: ["edit", "view"], default: null },
            token: { type: String, unique: true, sparse: true, default: null },
        },
        folders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Folder" }],
        permissions: {
            view: { type: Boolean, default: true },
            edit: { type: Boolean, default: false },
        },
        forms: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Form",
            }],
    },
    { timestamps: true }
);

const Workspace = mongoose.model("Workspace", workspaceSchema);
module.exports = Workspace;
