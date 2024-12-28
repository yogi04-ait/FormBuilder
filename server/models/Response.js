const mongoose = require('mongoose')
const responseSchema = new mongoose.Schema({
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Form"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    answers: [{
        elementId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        }
    }]
});

const Response = mongoose.model("Response", responseSchema);
module.exports = Response;
