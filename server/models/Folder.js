const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Workspace",
    },
    parentFolderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder",
        default: null,
    },
    childFolders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder",
    }],
    forms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Form",
    }],
}, { timestamps: true });

const Folder = mongoose.model("Folder", folderSchema);
module.exports = Folder;
