const { GoogleGenAI } = require("@google/genai");

function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error(
            "GEMINI_API_KEY is missing from the environment variables."
        );
    }

    return new GoogleGenAI({
        apiKey
    });
}

const studyPlanSchema = {
    type: "object",

    properties: {
        title: {
            type: "string",
            description:
                "A concise title for the study plan."
        },

        subject: {
            type: "string",
            description:
                "The main academic or professional subject."
        },

        description: {
            type: "string",
            description:
                "A short summary of the learning plan."
        },

        durationWeeks: {
            type: "integer",
            minimum: 1,
            maximum: 52
        },

        topics: {
            type: "array",

            items: {
                type: "object",

                properties: {
                    title: {
                        type: "string"
                    },

                    description: {
                        type: "string"
                    },

                    week: {
                        type: "integer",
                        minimum: 1
                    }
                },

                required: [
                    "title",
                    "description",
                    "week"
                ],

                additionalProperties: false
            },

            minItems: 1,
            maxItems: 30
        }
    },

    required: [
        "title",
        "subject",
        "description",
        "durationWeeks",
        "topics"
    ],

    additionalProperties: false
};

const quizSchema = {
    type: "object",

    properties: {
        questions: {
            type: "array",
            minItems: 5,
            maxItems: 5,

            items: {
                type: "object",

                properties: {
                    question: {
                        type: "string"
                    },

                    options: {
                        type: "array",
                        minItems: 4,
                        maxItems: 4,

                        items: {
                            type: "string"
                        }
                    },

                    correctOptionIndex: {
                        type: "integer",
                        minimum: 0,
                        maximum: 3
                    },

                    explanation: {
                        type: "string"
                    }
                },

                required: [
                    "question",
                    "options",
                    "correctOptionIndex",
                    "explanation"
                ],

                additionalProperties: false
            }
        }
    },

    required: [
        "questions"
    ],

    additionalProperties: false
};

async function generateStudyPlan({
    goal,
    durationWeeks,
    experienceLevel
}) {
    const ai = getGeminiClient();

    const prompt = `
Create a practical study plan for the following learner.

Learning goal:
${goal}

Duration:
${durationWeeks} weeks

Current experience level:
${experienceLevel}

Requirements:
- Create a clear and realistic progression.
- Start with fundamentals before advanced material.
- Each topic must belong to a specific week.
- Return between 5 and 30 topics.
- Keep descriptions concise.
- Do not include markdown.
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",

        contents: prompt,

        config: {
            responseMimeType: "application/json",
            responseJsonSchema: studyPlanSchema
        }
    });

    if (!response.text) {
        throw new Error(
            "Gemini returned an empty response."
        );
    }

    const plan = JSON.parse(response.text);

    return plan;
}

async function generateTopicQuiz({
    planTitle,
    planDescription,
    subject,
    topicTitle,
    topicDescription,
    week
}) {
    const ai = getGeminiClient();

    const model =
        process.env.GEMINI_MODEL ||
        "gemini-3.6-flash";

    const prompt = `
Create a five-question multiple-choice quiz for a student.

Study plan:
${planTitle}

Plan description:
${planDescription || "No description provided"}

Subject:
${subject}

Current topic:
${topicTitle}

Topic description:
${topicDescription || "No description provided"}

Week:
${week}

Requirements:
- Generate exactly 5 questions.
- Every question must contain exactly 4 answer options.
- Exactly one option must be correct.
- correctOptionIndex must be an integer from 0 to 3.
- Include a concise explanation for the correct answer.
- Questions should test understanding, not only memorization.
- Begin with an easier question and gradually increase difficulty.
- Keep every question directly related to the current topic.
- Do not use markdown.
`;

    const response =
        await ai.models.generateContent({
            model,
            contents: prompt,

            config: {
                responseMimeType:
                    "application/json",

                responseJsonSchema:
                    quizSchema,

                temperature: 0.5
            }
        });

    if (!response.text) {
        throw new Error(
            "Gemini returned an empty quiz."
        );
    }

    let result;

    try {
        result =
            JSON.parse(response.text);
    } catch (error) {
        console.error(
            "Quiz JSON parsing error:",
            error
        );

        throw new Error(
            "Gemini returned invalid quiz data."
        );
    }

    if (
        !Array.isArray(result.questions) ||
        result.questions.length !== 5
    ) {
        throw new Error(
            "Gemini did not generate exactly five questions."
        );
    }

    result.questions.forEach(
        (question, index) => {
            if (
                !Array.isArray(
                    question.options
                ) ||
                question.options.length !== 4
            ) {
                throw new Error(
                    `Question ${
                        index + 1
                    } does not contain four options.`
                );
            }

            if (
                !Number.isInteger(
                    question.correctOptionIndex
                ) ||
                question.correctOptionIndex < 0 ||
                question.correctOptionIndex > 3
            ) {
                throw new Error(
                    `Question ${
                        index + 1
                    } has an invalid correct answer.`
                );
            }
        }
    );

    return result.questions;
}

module.exports = {
    generateStudyPlan,
    generateTopicQuiz
};