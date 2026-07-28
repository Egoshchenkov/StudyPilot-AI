const mongoose = require("mongoose");

const quizQuestionSchema =
    new mongoose.Schema(
        {
            question: {
                type: String,
                required: true,
                trim: true,
                maxlength: 500
            },

            options: {
                type: [String],
                required: true,

                validate: {
                    validator(options) {
                        return (
                            Array.isArray(options) &&
                            options.length === 4 &&
                            options.every(
                                (option) =>
                                    typeof option ===
                                        "string" &&
                                    option.trim().length > 0
                            )
                        );
                    },

                    message:
                        "Every quiz question must contain exactly four options."
                }
            },

            correctOptionIndex: {
                type: Number,
                required: true,
                min: 0,
                max: 3
            },

            explanation: {
                type: String,
                required: true,
                trim: true,
                maxlength: 1000
            }
        },
        {
            _id: true
        }
    );

const quizSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StudyPlan",
            required: true,
            index: true
        },

        topicId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        topicTitle: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        questions: {
            type: [quizQuestionSchema],

            validate: {
                validator(questions) {
                    return (
                        Array.isArray(questions) &&
                        questions.length === 5
                    );
                },

                message:
                    "A quiz must contain exactly five questions."
            }
        },

        attempts: {
            type: Number,
            default: 0,
            min: 0
        },

        bestScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        passed: {
            type: Boolean,
            default: false
        },

        lastAttemptAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

quizSchema.index(
    {
        userId: 1,
        planId: 1,
        topicId: 1
    },
    {
        unique: true
    }
);

const Quiz = mongoose.model(
    "Quiz",
    quizSchema
);

module.exports = Quiz;