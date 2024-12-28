const mongoose = require('mongoose')

const formSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Workspace"
    },
    folderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder"
    },
    elements: [{
        type: {
            type: String,
            required: true,
            enum: ["bubble", "input"]
        },
        bubbleContent: {
            text: {
                type: String,
                required: function () { return this.type === "bubble"; }
            },
            image: {
                type: String,
                required: function () { return this.type === "bubble"; }
            }
        },
        inputField: {
            type: {
                type: String,
                enum: ["text", "number", "email", "phone", "date", "rating"],
                required: function () { return this.type === "input"; }
            },
            required: {
                type: Boolean,
                default: false
            },
            placeholder: String
        },
        order: {
            type: Number,
            required: true
        }
    }]
}, { timestamps: true });

const Form = mongoose.model("Form", formSchema);
module.exports = Form;
