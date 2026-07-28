const mongoose = require("mongoose");

const studyTopicSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        week: {
            type: Number,
            required: true,
            min: 1,
            max: 52
        },

        completed: {
            type: Boolean,
            default: false
        }
    },
    {
        _id: true
    }
);

const studyPlanSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 100
        },

        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 60
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        durationWeeks: {
            type: Number,
            min: 1,
            max: 52,
            default: 1
        },

        topics: {
            type: [studyTopicSchema],
            default: []
        },

        totalTopics: {
            type: Number,
            min: 1,
            default: 1
        },

        completedTopics: {
            type: Number,
            min: 0,
            default: 0
        },

        status: {
            type: String,
            enum: [
                "active",
                "paused",
                "completed"
            ],
            default: "active"
        },

        source: {
            type: String,
            enum: [
                "manual",
                "ai"
            ],
            default: "manual"
        }
    },
    {
        timestamps: true
    }
);

studyPlanSchema.pre("save", function () {
    if (
        Array.isArray(this.topics) &&
        this.topics.length > 0
    ) {
        this.totalTopics =
            this.topics.length;

        this.completedTopics =
            this.topics.filter(
                (topic) => topic.completed
            ).length;

        if (
            this.completedTopics ===
            this.totalTopics
        ) {
            this.status = "completed";
        } else if (
            this.status === "completed"
        ) {
            this.status = "active";
        }
    }
});

const StudyPlan = mongoose.model(
    "StudyPlan",
    studyPlanSchema
);

module.exports = StudyPlan;