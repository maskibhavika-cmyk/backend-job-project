const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    company: {
        type: String,
        required: true,
    },

    location: {
        type: String,
        required: true,
    },

    salary: {
        type: Number,
        required: true,
    },

    skills: [
        {
            type: String,
            required: true,
        }
    ],

    employment: {
        type: String,
        enum: ["Full Time", "Part Time", "Internship", "Contract"]
    },
status: {
    type: String,
    enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled"
    ],
    default: "pending"
},
progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
},

    // Soft Delete
    isDeleted: {
        type: Boolean,
        default: false
    },
    priority: {
    type: String,
    enum: ["high", "normal", "low"],
    default: "normal"
},

});

// Database Indexing
jobSchema.index({ company: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ salary: 1 });

const jobModel = mongoose.model("job", jobSchema);

module.exports = jobModel;