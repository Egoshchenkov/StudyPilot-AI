import {
    escapeHtml,
    showToast
} from "./ui.js";

import {
    loadStudyPlans
} from "./studyPlans.js";

const quizModal =
    document.getElementById("quiz-modal");

const quizCloseButton =
    document.getElementById(
        "quiz-modal-close"
    );

const quizTitle =
    document.getElementById(
        "quiz-modal-title"
    );

const quizLoading =
    document.getElementById(
        "quiz-loading"
    );

const quizContent =
    document.getElementById(
        "quiz-content"
    );

const quizResult =
    document.getElementById(
        "quiz-result"
    );

const questionCounter =
    document.getElementById(
        "quiz-question-counter"
    );

const bestScoreElement =
    document.getElementById(
        "quiz-best-score"
    );

const progressBar =
    document.getElementById(
        "quiz-progress-bar"
    );

const questionText =
    document.getElementById(
        "quiz-question-text"
    );

const optionsContainer =
    document.getElementById(
        "quiz-options"
    );

const quizMessage =
    document.getElementById(
        "quiz-message"
    );

const previousButton =
    document.getElementById(
        "quiz-previous-button"
    );

const nextButton =
    document.getElementById(
        "quiz-next-button"
    );

const resultIcon =
    document.getElementById(
        "quiz-result-icon"
    );

const resultTitle =
    document.getElementById(
        "quiz-result-title"
    );

const resultScore =
    document.getElementById(
        "quiz-result-score"
    );

const resultSummary =
    document.getElementById(
        "quiz-result-summary"
    );

const quizReview =
    document.getElementById(
        "quiz-review"
    );

const tryAgainButton =
    document.getElementById(
        "quiz-try-again-button"
    );

const finishButton =
    document.getElementById(
        "quiz-finish-button"
    );

let currentQuiz = null;
let currentQuestionIndex = 0;
let selectedAnswers = [];
let currentPlanId = null;
let currentTopicId = null;
let onQuizCompleted = null;

function setQuizView(view) {
    quizLoading.classList.toggle(
        "hidden",
        view !== "loading"
    );

    quizContent.classList.toggle(
        "hidden",
        view !== "quiz"
    );

    quizResult.classList.toggle(
        "hidden",
        view !== "result"
    );
}

function openQuizModal() {
    quizModal.classList.add("visible");

    quizModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );
}

function closeQuizModal() {
    quizModal.classList.remove("visible");

    quizModal.setAttribute(
        "aria-hidden",
        "true"
    );

    currentQuiz = null;
    currentQuestionIndex = 0;
    selectedAnswers = [];
    currentPlanId = null;
    currentTopicId = null;
    quizMessage.textContent = "";

    document.body.classList.remove(
        "modal-open"
    );
}

async function requestQuiz(
    planId,
    topicId
) {
    const response = await fetch(
        "/api/quizzes/generate",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                planId,
                topicId
            })
        }
    );

    const result = await response.json();

    if (response.status === 401) {
        window.location.href = "/signin";
        return null;
    }

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Unable to generate the quiz."
        );
    }

    return result.quiz;
}

async function submitQuizAnswers() {
    const response = await fetch(
        `/api/quizzes/${currentQuiz._id}/submit`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                answers:
                    selectedAnswers
            })
        }
    );

    const result = await response.json();

    if (response.status === 401) {
        window.location.href = "/signin";
        return null;
    }

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Unable to submit the quiz."
        );
    }

    return result;
}

function renderQuestion() {
    if (!currentQuiz) {
        return;
    }

    const question =
        currentQuiz.questions[
            currentQuestionIndex
        ];

    questionCounter.textContent =
        `Question ${
            currentQuestionIndex + 1
        } of ${
            currentQuiz.questions.length
        }`;

    bestScoreElement.textContent =
        `Best score: ${
            currentQuiz.bestScore || 0
        }%`;

    progressBar.style.width =
        `${
            (
                (currentQuestionIndex + 1) /
                currentQuiz.questions.length
            ) * 100
        }%`;

    questionText.textContent =
        question.question;

    optionsContainer.innerHTML = "";

    const optionLetters = [
        "A",
        "B",
        "C",
        "D"
    ];

    question.options.forEach(
        (option, optionIndex) => {
            const button =
                document.createElement(
                    "button"
                );

            button.type = "button";

            button.className =
                "quiz-option";

            if (
                selectedAnswers[
                    currentQuestionIndex
                ] === optionIndex
            ) {
                button.classList.add(
                    "selected"
                );
            }

            button.innerHTML = `
                <span class="quiz-option-letter">
                    ${optionLetters[optionIndex]}
                </span>

                <span class="quiz-option-text">
                    ${escapeHtml(option)}
                </span>
            `;

            button.addEventListener(
                "click",
                () => {
                    selectedAnswers[
                        currentQuestionIndex
                    ] = optionIndex;

                    renderQuestion();
                }
            );

            optionsContainer.appendChild(
                button
            );
        }
    );

    previousButton.disabled =
        currentQuestionIndex === 0;

    const isLastQuestion =
        currentQuestionIndex ===
        currentQuiz.questions.length - 1;

    nextButton.textContent =
        isLastQuestion
            ? "Submit Quiz"
            : "Next";
}

function renderQuizResult(result) {
    setQuizView("result");

    resultIcon.textContent =
        result.passed ? "✓" : "!";

    resultIcon.classList.toggle(
        "failed",
        !result.passed
    );

    resultTitle.textContent =
        result.passed
            ? "Quiz passed"
            : "Keep practicing";

    resultScore.textContent =
        `${result.score}%`;

    resultSummary.textContent =
        result.passed
            ? `You answered ${result.correctAnswers} of ${result.totalQuestions} questions correctly. This topic has been marked as completed.`
            : `You answered ${result.correctAnswers} of ${result.totalQuestions} questions correctly. You need ${result.passingScore}% to pass.`;

    tryAgainButton.classList.toggle(
        "hidden",
        result.passed
    );

    quizReview.innerHTML = "";

    result.answers.forEach(
        (answer, index) => {
            const item =
                document.createElement(
                    "article"
                );

            item.className =
                `quiz-review-item ${
                    answer.isCorrect
                        ? "correct"
                        : "incorrect"
                }`;

            const selectedAnswer =
                answer.options[
                    answer.selectedOptionIndex
                ];

            const correctAnswer =
                answer.options[
                    answer.correctOptionIndex
                ];

            item.innerHTML = `
                <strong>
                    ${index + 1}.
                    ${escapeHtml(
                        answer.question
                    )}
                </strong>

                <div class="quiz-review-answer">
                    <span>
                        Your answer:
                        <b>
                            ${escapeHtml(
                                selectedAnswer
                            )}
                        </b>
                    </span>

                    ${
                        answer.isCorrect
                            ? ""
                            : `
                                <span>
                                    Correct answer:
                                    <b>
                                        ${escapeHtml(
                                            correctAnswer
                                        )}
                                    </b>
                                </span>
                            `
                    }
                </div>

                <p class="quiz-review-explanation">
                    ${escapeHtml(
                        answer.explanation
                    )}
                </p>
            `;

            quizReview.appendChild(item);
        }
    );
}

async function handleNextQuestion() {
    quizMessage.textContent = "";

    if (
        selectedAnswers[
            currentQuestionIndex
        ] === undefined
    ) {
        quizMessage.textContent =
            "Please select an answer before continuing.";

        return;
    }

    const isLastQuestion =
        currentQuestionIndex ===
        currentQuiz.questions.length - 1;

    if (!isLastQuestion) {
        currentQuestionIndex += 1;
        renderQuestion();
        return;
    }

    const unansweredQuestion =
        selectedAnswers.findIndex(
            (answer) =>
                answer === undefined
        );

    if (unansweredQuestion !== -1) {
        currentQuestionIndex =
            unansweredQuestion;

        quizMessage.textContent =
            "Please answer every question.";

        renderQuestion();
        return;
    }

    nextButton.disabled = true;
    previousButton.disabled = true;
    nextButton.textContent =
        "Submitting...";

    try {
        const response =
            await submitQuizAnswers();

        if (!response) {
            return;
        }

        renderQuizResult(
            response.result
        );

        await loadStudyPlans();

        if (
            typeof onQuizCompleted ===
            "function"
        ) {
            await onQuizCompleted(
                response.plan
            );
        }

        showToast(
            response.result.passed
                ? "Quiz passed. Topic completed."
                : "Quiz completed. Review your answers."
        );
    } catch (error) {
        console.error(
            "Submit quiz error:",
            error
        );

        quizMessage.textContent =
            error.message;

        showToast(
            error.message,
            "error"
        );
    } finally {
        nextButton.disabled = false;
        previousButton.disabled =
            currentQuestionIndex === 0;

        nextButton.textContent =
            "Submit Quiz";
    }
}

export async function startTopicQuiz({
    planId,
    topicId,
    topicTitle,
    onComplete
}) {
    currentPlanId = planId;
    currentTopicId = topicId;
    onQuizCompleted = onComplete;

    quizTitle.textContent =
        `${topicTitle} Quiz`;

    setQuizView("loading");
    openQuizModal();

    try {
        const quiz =
            await requestQuiz(
                planId,
                topicId
            );

        if (!quiz) {
            return;
        }

        currentQuiz = quiz;
        currentQuestionIndex = 0;

        selectedAnswers =
            new Array(
                quiz.questions.length
            ).fill(undefined);

        setQuizView("quiz");
        renderQuestion();
    } catch (error) {
        console.error(
            "Load quiz error:",
            error
        );

        closeQuizModal();

        showToast(
            error.message,
            "error"
        );
    }
}

function restartQuiz() {
    if (!currentQuiz) {
        return;
    }

    currentQuestionIndex = 0;

    selectedAnswers =
        new Array(
            currentQuiz.questions.length
        ).fill(undefined);

    quizMessage.textContent = "";

    setQuizView("quiz");
    renderQuestion();
}

function initializeQuizModal() {
    quizCloseButton.addEventListener(
        "click",
        closeQuizModal
    );

    finishButton.addEventListener(
        "click",
        closeQuizModal
    );

    tryAgainButton.addEventListener(
        "click",
        restartQuiz
    );

    previousButton.addEventListener(
        "click",
        () => {
            if (
                currentQuestionIndex > 0
            ) {
                currentQuestionIndex -= 1;
                quizMessage.textContent = "";
                renderQuestion();
            }
        }
    );

    nextButton.addEventListener(
        "click",
        handleNextQuestion
    );

    quizModal.addEventListener(
        "click",
        (event) => {
            if (
                event.target === quizModal
            ) {
                closeQuizModal();
            }
        }
    );

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Escape" &&
                quizModal.classList.contains(
                    "visible"
                )
            ) {
                closeQuizModal();
            }
        }
    );
}

export function initializeQuiz() {
    initializeQuizModal();
}