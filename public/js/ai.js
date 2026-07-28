import {
    escapeHtml,
    showToast
} from "./ui.js";

import {
    loadStudyPlans
} from "./studyPlans.js";

/*
    AI generation modal
*/

const aiModal =
    document.getElementById(
        "ai-plan-modal"
    );

const aiForm =
    document.getElementById(
        "ai-plan-form"
    );

const aiGoalInput =
    document.getElementById(
        "ai-goal"
    );

const aiDurationInput =
    document.getElementById(
        "ai-duration"
    );

const aiLevelInput =
    document.getElementById(
        "ai-level"
    );

const aiFormMessage =
    document.getElementById(
        "ai-form-message"
    );

const aiSubmitButton =
    document.getElementById(
        "ai-plan-submit"
    );

const aiCloseButton =
    document.getElementById(
        "ai-plan-modal-close"
    );

const aiCancelButton =
    document.getElementById(
        "ai-plan-cancel"
    );

/*
    AI preview modal
*/

const previewModal =
    document.getElementById(
        "ai-preview-modal"
    );

const previewCloseButton =
    document.getElementById(
        "ai-preview-close"
    );

const previewCancelButton =
    document.getElementById(
        "ai-preview-cancel"
    );

const regenerateButton =
    document.getElementById(
        "ai-regenerate-button"
    );

const savePlanButton =
    document.getElementById(
        "ai-save-plan"
    );

const previewPlanTitle =
    document.getElementById(
        "ai-preview-plan-title"
    );

const previewSubject =
    document.getElementById(
        "ai-preview-subject"
    );

const previewDuration =
    document.getElementById(
        "ai-preview-duration"
    );

const previewDescription =
    document.getElementById(
        "ai-preview-description"
    );

const previewTopics =
    document.getElementById(
        "ai-preview-topics"
    );

const previewMessage =
    document.getElementById(
        "ai-preview-message"
    );

let generatedPlan = null;

function lockPageScroll() {
    document.body.classList.add(
        "modal-open"
    );
}

function unlockPageScrollIfNeeded() {
    const anyModalVisible =
        aiModal.classList.contains("visible") ||
        previewModal.classList.contains(
            "visible"
        );

    if (!anyModalVisible) {
        document.body.classList.remove(
            "modal-open"
        );
    }
}

function openAiModal() {
    const dashboardQuestionInput =
        document.getElementById(
            "ai-question"
        );

    if (
        dashboardQuestionInput &&
        dashboardQuestionInput.value.trim()
    ) {
        aiGoalInput.value =
            dashboardQuestionInput.value.trim();
    }

    aiModal.classList.add("visible");

    aiModal.setAttribute(
        "aria-hidden",
        "false"
    );

    aiFormMessage.textContent = "";

    lockPageScroll();

    setTimeout(() => {
        aiGoalInput.focus();
    }, 100);
}

function closeAiModal() {
    aiModal.classList.remove("visible");

    aiModal.setAttribute(
        "aria-hidden",
        "true"
    );

    aiFormMessage.textContent = "";

    unlockPageScrollIfNeeded();
}

function openPreviewModal() {
    previewModal.classList.add("visible");

    previewModal.setAttribute(
        "aria-hidden",
        "false"
    );

    previewMessage.textContent = "";

    lockPageScroll();

    setTimeout(() => {
        savePlanButton.focus();
    }, 100);
}

function closePreviewModal() {
    previewModal.classList.remove(
        "visible"
    );

    previewModal.setAttribute(
        "aria-hidden",
        "true"
    );

    previewMessage.textContent = "";

    unlockPageScrollIfNeeded();
}

async function requestStudyPlan() {
    const response = await fetch(
        "/api/ai/generate-plan",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                goal:
                    aiGoalInput.value.trim(),

                durationWeeks: Number(
                    aiDurationInput.value
                ),

                experienceLevel:
                    aiLevelInput.value
            })
        }
    );

    const result = await response.json();

    if (response.status === 401) {
        window.location.href =
            "/signin";

        return null;
    }

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Unable to generate a study plan."
        );
    }

    return result.plan;
}

async function saveGeneratedPlan() {
    if (!generatedPlan) {
        throw new Error(
            "There is no generated plan to save."
        );
    }

    const response = await fetch(
        "/api/study-plans/ai",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify(
                generatedPlan
            )
        }
    );

    const result = await response.json();

    if (response.status === 401) {
        window.location.href =
            "/signin";

        return null;
    }

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Unable to save the AI study plan."
        );
    }

    return result.plan;
}

function groupTopicsByWeek(topics) {
    return topics.reduce(
        (weeks, topic) => {
            const week = Number(
                topic.week
            );

            if (!weeks[week]) {
                weeks[week] = [];
            }

            weeks[week].push(topic);

            return weeks;
        },
        {}
    );
}

function renderPlanPreview(plan) {
    previewPlanTitle.textContent =
        plan.title;

    previewSubject.textContent =
        plan.subject;

    previewDuration.textContent =
        `${plan.durationWeeks} ${
            plan.durationWeeks === 1
                ? "week"
                : "weeks"
        }`;

    previewDescription.textContent =
        plan.description ||
        "No description provided.";

    previewTopics.innerHTML = "";

    const groupedTopics =
        groupTopicsByWeek(plan.topics);

    const weekNumbers = Object.keys(
        groupedTopics
    )
        .map(Number)
        .sort((a, b) => a - b);

    weekNumbers.forEach((weekNumber) => {
        const weekTopics =
            groupedTopics[weekNumber];

        const weekElement =
            document.createElement(
                "section"
            );

        weekElement.className = "ai-week";

        weekElement.innerHTML = `
            <div class="ai-week-header">
                <h4>
                    Week ${weekNumber}
                </h4>

                <span>
                    ${weekTopics.length}
                    ${
                        weekTopics.length === 1
                            ? "topic"
                            : "topics"
                    }
                </span>
            </div>

            <div class="ai-topic-list">
                ${weekTopics
                    .map(
                        (
                            topic,
                            index
                        ) => `
                            <article class="ai-topic">
                                <span class="ai-topic-number">
                                    ${index + 1}
                                </span>

                                <div class="ai-topic-content">
                                    <strong>
                                        ${escapeHtml(
                                            topic.title
                                        )}
                                    </strong>

                                    <p>
                                        ${
                                            topic.description
                                                ? escapeHtml(
                                                    topic.description
                                                )
                                                : "No description provided."
                                        }
                                    </p>
                                </div>
                            </article>
                        `
                    )
                    .join("")}
            </div>
        `;

        previewTopics.appendChild(
            weekElement
        );
    });
}

async function generateAndPreviewPlan() {
    aiFormMessage.textContent = "";

    if (!aiForm.checkValidity()) {
        aiForm.reportValidity();
        return;
    }

    aiSubmitButton.disabled = true;

    aiSubmitButton.textContent =
        "Generating...";

    try {
        const plan =
            await requestStudyPlan();

        if (!plan) {
            return;
        }

        if (
            !Array.isArray(plan.topics) ||
            plan.topics.length === 0
        ) {
            throw new Error(
                "AI generated a plan without topics."
            );
        }

        generatedPlan = plan;

        renderPlanPreview(
            generatedPlan
        );

        closeAiModal();
        openPreviewModal();
    } catch (error) {
        console.error(
            "AI generation error:",
            error
        );

        aiFormMessage.textContent =
            error.message;

        showToast(
            error.message,
            "error"
        );
    } finally {
        aiSubmitButton.disabled = false;

        aiSubmitButton.textContent =
            "Generate Plan";
    }
}

function initializeAiForm() {
    aiForm.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            await generateAndPreviewPlan();
        }
    );
}

function initializePreviewActions() {
    previewCloseButton.addEventListener(
        "click",
        closePreviewModal
    );

    previewCancelButton.addEventListener(
        "click",
        closePreviewModal
    );

    previewModal.addEventListener(
        "click",
        (event) => {
            if (
                event.target === previewModal
            ) {
                closePreviewModal();
            }
        }
    );

    regenerateButton.addEventListener(
        "click",
        () => {
            closePreviewModal();
            openAiModal();
        }
    );

    savePlanButton.addEventListener(
        "click",
        async () => {
            if (!generatedPlan) {
                return;
            }

            previewMessage.textContent = "";

            savePlanButton.disabled = true;

            savePlanButton.textContent =
                "Saving...";

            regenerateButton.disabled = true;
            previewCancelButton.disabled =
                true;

            try {
                const savedPlan =
                    await saveGeneratedPlan();

                if (!savedPlan) {
                    return;
                }

                generatedPlan = null;

                closePreviewModal();

                const dashboardQuestionInput =
                    document.getElementById(
                        "ai-question"
                    );

                if (
                    dashboardQuestionInput
                ) {
                    dashboardQuestionInput.value =
                        "";
                }

                aiForm.reset();

                await loadStudyPlans();

                showToast(
                    "AI study plan saved successfully."
                );

                document
                    .getElementById(
                        "study-plans"
                    )
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
            } catch (error) {
                console.error(
                    "Save AI plan error:",
                    error
                );

                previewMessage.textContent =
                    error.message;

                showToast(
                    error.message,
                    "error"
                );
            } finally {
                savePlanButton.disabled =
                    false;

                savePlanButton.textContent =
                    "Save Plan";

                regenerateButton.disabled =
                    false;

                previewCancelButton.disabled =
                    false;
            }
        }
    );
}

function initializeAiModal() {
    const aiButtons = [
        document.getElementById(
            "generate-plan-button"
        ),

        document.getElementById(
            "ask-ai-button"
        )
    ].filter(Boolean);

    const dashboardAiForm =
        document.getElementById(
            "ai-form"
        );

    dashboardAiForm?.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();
            openAiModal();
        }
    );

    aiButtons.forEach((button) => {
        button.addEventListener(
            "click",
            openAiModal
        );
    });

    aiCloseButton.addEventListener(
        "click",
        closeAiModal
    );

    aiCancelButton.addEventListener(
        "click",
        closeAiModal
    );

    aiModal.addEventListener(
        "click",
        (event) => {
            if (event.target === aiModal) {
                closeAiModal();
            }
        }
    );

    document.addEventListener(
        "keydown",
        (event) => {
            if (event.key !== "Escape") {
                return;
            }

            if (
                previewModal.classList.contains(
                    "visible"
                )
            ) {
                closePreviewModal();
                return;
            }

            if (
                aiModal.classList.contains(
                    "visible"
                )
            ) {
                closeAiModal();
            }
        }
    );
}

export function initializeAi() {
    initializeAiModal();
    initializeAiForm();
    initializePreviewActions();
}