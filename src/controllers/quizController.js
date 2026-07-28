const mongoose =
    require("mongoose");

const Quiz =
    require("../models/Quiz");

const StudyPlan =
    require("../models/StudyPlan");

const {
    generateTopicQuiz
} = require(
    "../services/geminiService"
);

const PASSING_SCORE = 70;

function createPublicQuiz(quiz) {
    return {
        _id: quiz._id,
        planId: quiz.planId,
        topicId: quiz.topicId,
        topicTitle: quiz.topicTitle,
        attempts: quiz.attempts,
        bestScore: quiz.bestScore,
        passed: quiz.passed,

        questions: quiz.questions.map(
            (question) => ({
                _id: question._id,

                question:
                    question.question,

                options:
                    question.options
            })
        )
    };
}

async function generateQuiz(req, res) {
    try {
        const {
            planId,
            topicId
        } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(
                planId
            ) ||
            !mongoose.Types.ObjectId.isValid(
                topicId
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid plan or topic ID."
            });
        }

        const plan =
            await StudyPlan.findOne({
                _id: planId,
                userId:
                    req.session.userId
            });

        if (!plan) {
            return res.status(404).json({
                message:
                    "Study plan not found."
            });
        }

        const topic =
            plan.topics.id(topicId);

        if (!topic) {
            return res.status(404).json({
                message:
                    "Study topic not found."
            });
        }

        /*
            Если квиз уже был создан,
            повторно Gemini не вызываем.
        */
        let quiz = await Quiz.findOne({
            userId:
                req.session.userId,

            planId: plan._id,

            topicId: topic._id
        });

        if (quiz) {
            return res.status(200).json({
                message:
                    "Existing quiz loaded successfully.",

                quiz:
                    createPublicQuiz(quiz)
            });
        }

        const questions =
            await generateTopicQuiz({
                planTitle:
                    plan.title,

                planDescription:
                    plan.description,

                subject:
                    plan.subject,

                topicTitle:
                    topic.title,

                topicDescription:
                    topic.description,

                week:
                    topic.week
            });

        quiz = await Quiz.create({
            userId:
                req.session.userId,

            planId:
                plan._id,

            topicId:
                topic._id,

            topicTitle:
                topic.title,

            questions
        });

        res.status(201).json({
            message:
                "Quiz generated successfully.",

            quiz:
                createPublicQuiz(quiz)
        });
    } catch (error) {
        console.error(
            "Generate quiz error:",
            error
        );

        if (error.code === 11000) {
            const existingQuiz =
                await Quiz.findOne({
                    userId:
                        req.session.userId,

                    planId:
                        req.body.planId,

                    topicId:
                        req.body.topicId
                });

            if (existingQuiz) {
                return res.status(200).json({
                    message:
                        "Existing quiz loaded successfully.",

                    quiz:
                        createPublicQuiz(
                            existingQuiz
                        )
                });
            }
        }

        res.status(500).json({
            message:
                error.message ||
                "Unable to generate the quiz."
        });
    }
}

async function submitQuiz(req, res) {
    try {
        const {
            quizId
        } = req.params;

        const {
            answers
        } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(
                quizId
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid quiz ID."
            });
        }

        if (
            !Array.isArray(answers)
        ) {
            return res.status(400).json({
                message:
                    "Quiz answers must be provided as an array."
            });
        }

        const quiz =
            await Quiz.findOne({
                _id: quizId,
                userId:
                    req.session.userId
            });

        if (!quiz) {
            return res.status(404).json({
                message:
                    "Quiz not found."
            });
        }

        if (
            answers.length !==
            quiz.questions.length
        ) {
            return res.status(400).json({
                message:
                    `Please answer all ${quiz.questions.length} questions.`
            });
        }

        const invalidAnswer =
            answers.some(
                (answer) =>
                    !Number.isInteger(
                        answer
                    ) ||
                    answer < 0 ||
                    answer > 3
            );

        if (invalidAnswer) {
            return res.status(400).json({
                message:
                    "One or more quiz answers are invalid."
            });
        }

        let correctAnswers = 0;

        const results =
            quiz.questions.map(
                (
                    question,
                    index
                ) => {
                    const selectedIndex =
                        answers[index];

                    const isCorrect =
                        selectedIndex ===
                        question
                            .correctOptionIndex;

                    if (isCorrect) {
                        correctAnswers += 1;
                    }

                    return {
                        questionId:
                            question._id,

                        question:
                            question.question,

                        options:
                            question.options,

                        selectedOptionIndex:
                            selectedIndex,

                        correctOptionIndex:
                            question
                                .correctOptionIndex,

                        isCorrect,

                        explanation:
                            question.explanation
                    };
                }
            );

        const score = Math.round(
            (
                correctAnswers /
                quiz.questions.length
            ) * 100
        );

        const passed =
            score >= PASSING_SCORE;

        quiz.attempts += 1;

        quiz.bestScore = Math.max(
            quiz.bestScore,
            score
        );

        quiz.passed =
            quiz.passed || passed;

        quiz.lastAttemptAt =
            new Date();

        await quiz.save();

        const plan =
            await StudyPlan.findOne({
                _id: quiz.planId,
                userId:
                    req.session.userId
            });

        if (!plan) {
            return res.status(404).json({
                message:
                    "The associated study plan was not found."
            });
        }

        const topic =
            plan.topics.id(
                quiz.topicId
            );

        if (!topic) {
            return res.status(404).json({
                message:
                    "The associated study topic was not found."
            });
        }

        /*
            Успешный квиз завершает тему.
            Неуспешная повторная попытка
            уже завершённую тему не отменяет.
        */
        if (passed) {
            topic.completed = true;
            await plan.save();
        }

        res.status(200).json({
            message: passed
                ? "Quiz passed successfully."
                : "Quiz completed. Review the answers and try again.",

            result: {
                correctAnswers,

                totalQuestions:
                    quiz.questions.length,

                score,

                passingScore:
                    PASSING_SCORE,

                passed,

                attempts:
                    quiz.attempts,

                bestScore:
                    quiz.bestScore,

                answers:
                    results
            },

            plan
        });
    } catch (error) {
        console.error(
            "Submit quiz error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to submit the quiz."
        });
    }
}

module.exports = {
    generateQuiz,
    submitQuiz
};