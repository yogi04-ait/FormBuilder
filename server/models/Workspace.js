const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ["shared", "personal"]
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    folders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder"
    }],
    permissions: {
        view: { type: Boolean, default: true },
        edit: { type: Boolean, default: false }
    }
}, { timestamps: true });

const Workspace = mongoose.model("Workspace", workspaceSchema);
module.exports = Workspace;
