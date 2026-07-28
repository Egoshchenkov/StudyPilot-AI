const mongoose = require("mongoose");
const StudyPlan = require("../models/StudyPlan");

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

async function getStudyPlans(req, res) {
    try {
        const plans = await StudyPlan.find({
            userId: req.session.userId
        }).sort({
            updatedAt: -1
        });

        return res.status(200).json({
            success: true,
            count: plans.length,
            plans
        });
    } catch (error) {
        console.error(
            "Get study plans error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to retrieve study plans."
        });
    }
}

async function getStudyPlanById(req, res) {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid study plan ID."
            });
        }

        const plan = await StudyPlan.findOne({
            _id: id,
            userId: req.session.userId
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "Study plan not found."
            });
        }

        return res.status(200).json({
            success: true,
            plan
        });
    } catch (error) {
        console.error(
            "Get study plan error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to retrieve the study plan."
        });
    }
}

async function createStudyPlan(req, res) {
    try {
        const {
            title,
            subject,
            description,
            totalTopics
        } = req.body;

        if (!title || !subject) {
            return res.status(400).json({
                success: false,
                message:
                    "Title and subject are required."
            });
        }

        const normalizedTitle = title.trim();
        const normalizedSubject = subject.trim();

        const parsedTotalTopics = Number(
            totalTopics || 10
        );

        if (normalizedTitle.length < 3) {
            return res.status(400).json({
                success: false,
                message:
                    "Title must contain at least 3 characters."
            });
        }

        if (
            !Number.isInteger(parsedTotalTopics) ||
            parsedTotalTopics < 1 ||
            parsedTotalTopics > 100
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Total topics must be a whole number between 1 and 100."
            });
        }

        const plan = await StudyPlan.create({
            userId: req.session.userId,
            title: normalizedTitle,
            subject: normalizedSubject,
            description:
                typeof description === "string"
                    ? description.trim()
                    : "",
            totalTopics: parsedTotalTopics,
            completedTopics: 0,
            status: "active"
        });

        return res.status(201).json({
            success: true,
            message:
                "Study plan created successfully.",
            plan
        });
    } catch (error) {
        console.error(
            "Create study plan error:",
            error
        );

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message:
                    "The study plan contains invalid data."
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Unable to create the study plan."
        });
    }
}

async function updateStudyPlan(req, res) {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid study plan ID."
            });
        }

        const plan = await StudyPlan.findOne({
            _id: id,
            userId: req.session.userId
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "Study plan not found."
            });
        }

        const {
            title,
            subject,
            description,
            totalTopics,
            completedTopics,
            status
        } = req.body;

        if (title !== undefined) {
            const normalizedTitle = title.trim();

            if (normalizedTitle.length < 3) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Title must contain at least 3 characters."
                });
            }

            plan.title = normalizedTitle;
        }

        if (subject !== undefined) {
            const normalizedSubject =
                subject.trim();

            if (!normalizedSubject) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Subject cannot be empty."
                });
            }

            plan.subject = normalizedSubject;
        }

        if (description !== undefined) {
            plan.description =
                typeof description === "string"
                    ? description.trim()
                    : "";
        }

        if (totalTopics !== undefined) {
            const parsedTotal = Number(
                totalTopics
            );

            if (
                !Number.isInteger(parsedTotal) ||
                parsedTotal < 1 ||
                parsedTotal > 100
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Total topics must be a whole number between 1 and 100."
                });
            }

            plan.totalTopics = parsedTotal;
        }

        if (completedTopics !== undefined) {
            const parsedCompleted = Number(
                completedTopics
            );

            if (
                !Number.isInteger(parsedCompleted) ||
                parsedCompleted < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Completed topics must be a non-negative whole number."
                });
            }

            plan.completedTopics =
                parsedCompleted;
        }

        if (status !== undefined) {
            const allowedStatuses = [
                "active",
                "completed",
                "paused"
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Status must be active, completed, or paused."
                });
            }

            plan.status = status;
        }

        if (
            plan.completedTopics >
            plan.totalTopics
        ) {
            plan.completedTopics =
                plan.totalTopics;
        }

        if (
            plan.completedTopics ===
            plan.totalTopics
        ) {
            plan.status = "completed";
        }

        await plan.save();

        return res.status(200).json({
            success: true,
            message:
                "Study plan updated successfully.",
            plan
        });
    } catch (error) {
        console.error(
            "Update study plan error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to update the study plan."
        });
    }
}

async function deleteStudyPlan(req, res) {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid study plan ID."
            });
        }

        const deletedPlan =
            await StudyPlan.findOneAndDelete({
                _id: id,
                userId: req.session.userId
            });

        if (!deletedPlan) {
            return res.status(404).json({
                success: false,
                message: "Study plan not found."
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Study plan deleted successfully."
        });
    } catch (error) {
        console.error(
            "Delete study plan error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to delete the study plan."
        });
    }
}

async function createAiStudyPlan(req, res) {
    try {
        const {
            title,
            subject,
            description,
            durationWeeks,
            topics
        } = req.body;

        const cleanTitle =
            typeof title === "string"
                ? title.trim()
                : "";

        const cleanSubject =
            typeof subject === "string"
                ? subject.trim()
                : "";

        const cleanDescription =
            typeof description === "string"
                ? description.trim()
                : "";

        const weeks = Number(durationWeeks);

        if (
            cleanTitle.length < 3 ||
            cleanTitle.length > 100
        ) {
            return res.status(400).json({
                message:
                    "The plan title must contain between 3 and 100 characters."
            });
        }

        if (
            !cleanSubject ||
            cleanSubject.length > 60
        ) {
            return res.status(400).json({
                message:
                    "Please provide a valid subject."
            });
        }

        if (
            !Number.isInteger(weeks) ||
            weeks < 1 ||
            weeks > 52
        ) {
            return res.status(400).json({
                message:
                    "Duration must be between 1 and 52 weeks."
            });
        }

        if (
            !Array.isArray(topics) ||
            topics.length < 1 ||
            topics.length > 30
        ) {
            return res.status(400).json({
                message:
                    "The AI plan must contain between 1 and 30 topics."
            });
        }

        const sanitizedTopics = topics.map(
            (topic) => {
                const topicTitle =
                    typeof topic.title === "string"
                        ? topic.title.trim()
                        : "";

                const topicDescription =
                    typeof topic.description === "string"
                        ? topic.description.trim()
                        : "";

                const topicWeek =
                    Number(topic.week);

                if (
                    !topicTitle ||
                    topicTitle.length > 150
                ) {
                    throw new Error(
                        "One or more AI topics have an invalid title."
                    );
                }

                if (
                    !Number.isInteger(topicWeek) ||
                    topicWeek < 1 ||
                    topicWeek > weeks
                ) {
                    throw new Error(
                        "One or more AI topics have an invalid week number."
                    );
                }

                return {
                    title: topicTitle,
                    description:
                        topicDescription,
                    week: topicWeek,
                    completed: false
                };
            }
        );

        const plan = await StudyPlan.create({
            userId: req.session.userId,

            title: cleanTitle,
            subject: cleanSubject,
            description:
                cleanDescription,

            durationWeeks: weeks,
            topics: sanitizedTopics,

            totalTopics:
                sanitizedTopics.length,

            completedTopics: 0,
            status: "active",
            source: "ai"
        });

        res.status(201).json({
            message:
                "AI study plan saved successfully.",
            plan
        });
    } catch (error) {
        console.error(
            "Create AI study plan error:",
            error
        );

        if (
            error.message.startsWith(
                "One or more AI topics"
            )
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({
            message:
                "Unable to save the AI study plan."
        });
    }
}

async function updateStudyTopic(req, res) {
    try {
        const {
            planId,
            topicId
        } = req.params;

        const {
            completed
        } = req.body;

        if (typeof completed !== "boolean") {
            return res.status(400).json({
                message:
                    "The completed value must be true or false."
            });
        }

        const plan = await StudyPlan.findOne({
            _id: planId,
            userId: req.session.userId
        });

        if (!plan) {
            return res.status(404).json({
                message:
                    "Study plan not found."
            });
        }

        const topic = plan.topics.id(
            topicId
        );

        if (!topic) {
            return res.status(404).json({
                message:
                    "Study topic not found."
            });
        }

        topic.completed = completed;

        await plan.save();

        res.status(200).json({
            message:
                "Study topic updated successfully.",
            plan
        });
    } catch (error) {
        console.error(
            "Update study topic error:",
            error
        );

        if (error.name === "CastError") {
            return res.status(400).json({
                message:
                    "Invalid study plan or topic ID."
            });
        }

        res.status(500).json({
            message:
                "Unable to update the study topic."
        });
    }
}

module.exports = {
    getStudyPlans,
    getStudyPlanById,
    createStudyPlan,
    createAiStudyPlan,
    updateStudyPlan,
    updateStudyTopic,
    deleteStudyPlan
};