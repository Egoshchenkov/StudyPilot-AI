const {
    generateStudyPlan
} = require("../services/geminiService");

async function generatePlan(req, res) {
    try {
        const {
            goal,
            durationWeeks,
            experienceLevel
        } = req.body;

        const cleanGoal =
            typeof goal === "string"
                ? goal.trim()
                : "";

        const cleanLevel =
            typeof experienceLevel === "string"
                ? experienceLevel.trim()
                : "";

        const weeks = Number(durationWeeks);

        if (cleanGoal.length < 5) {
            return res.status(400).json({
                message:
                    "Please describe your learning goal in more detail."
            });
        }

        if (cleanGoal.length > 500) {
            return res.status(400).json({
                message:
                    "The learning goal cannot exceed 500 characters."
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

        const allowedLevels = [
            "beginner",
            "intermediate",
            "advanced"
        ];

        if (
            !allowedLevels.includes(
                cleanLevel
            )
        ) {
            return res.status(400).json({
                message:
                    "Please select a valid experience level."
            });
        }

        const plan =
            await generateStudyPlan({
                goal: cleanGoal,
                durationWeeks: weeks,
                experienceLevel: cleanLevel
            });

        res.status(200).json({
            message:
                "Study plan generated successfully.",
            plan
        });
    } catch (error) {
        console.error(
            "Generate AI study plan error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to generate a study plan right now."
        });
    }
}

module.exports = {
    generatePlan
};