import {
    calculateProgress,
    escapeHtml,
    formatUpdatedDate,
    showToast
} from "./ui.js";

import {
    updateOverview
} from "./overview.js";

import {
    startTopicQuiz
} from "./quiz.js";

const plansGrid =
    document.getElementById("plans-grid");

const modal =
    document.getElementById("plan-modal");

const modalTitle =
    document.getElementById("plan-modal-title");

const modalCloseButton =
    document.getElementById("plan-modal-close");

const cancelButton =
    document.getElementById("plan-cancel-button");

const deleteButton =
    document.getElementById("plan-delete-button");

const planForm =
    document.getElementById("plan-form");

const formMessage =
    document.getElementById("plan-form-message");

const submitButton =
    document.getElementById("plan-submit-button");

const planIdInput =
    document.getElementById("plan-id");

const titleInput =
    document.getElementById("plan-title");

const subjectInput =
    document.getElementById("plan-subject");

const descriptionInput =
    document.getElementById("plan-description");

const totalTopicsInput =
    document.getElementById("plan-topics");

const completedTopicsInput =
    document.getElementById(
        "plan-completed-topics"
    );

const statusInput =
    document.getElementById("plan-status");

const editOnlyElements =
    document.querySelectorAll(".edit-only");

const deleteModal =
    document.getElementById("delete-modal");

const deletePlanName =
    document.getElementById("delete-plan-name");

const deleteCancelButton =
    document.getElementById(
        "delete-cancel-button"
    );

const deleteConfirmButton =
    document.getElementById(
        "delete-confirm-button"
    );

const planViewModal =
    document.getElementById(
        "plan-view-modal"
    );

const planViewClose =
    document.getElementById(
        "plan-view-close"
    );

const planViewCloseButton =
    document.getElementById(
        "plan-view-close-button"
    );

const planViewEditButton =
    document.getElementById(
        "plan-view-edit"
    );

const planViewDeleteButton =
    document.getElementById(
        "plan-view-delete"
    );

const planViewLabel =
    document.getElementById(
        "plan-view-label"
    );

const planViewTitle =
    document.getElementById(
        "plan-view-title"
    );

const planViewSubject =
    document.getElementById(
        "plan-view-subject"
    );

const planViewDuration =
    document.getElementById(
        "plan-view-duration"
    );

const planViewStatus =
    document.getElementById(
        "plan-view-status"
    );

const planViewDescription =
    document.getElementById(
        "plan-view-description"
    );

const planViewProgressText =
    document.getElementById(
        "plan-view-progress-text"
    );

const planViewProgressPercent =
    document.getElementById(
        "plan-view-progress-percent"
    );

const planViewProgressBar =
    document.getElementById(
        "plan-view-progress-bar"
    );

const planViewContent =
    document.getElementById(
        "plan-view-content"
    );

const planViewMessage =
    document.getElementById(
        "plan-view-message"
    );

let modalMode = "create";

let currentViewedPlan = null;
let planIdPendingDeletion = null;

function setModalMode(mode) {
    modalMode = mode;

    const isEditing = mode === "edit";

    modalTitle.textContent = isEditing
        ? "Edit Study Plan"
        : "Create Study Plan";

    submitButton.textContent = isEditing
        ? "Save Changes"
        : "Create Plan";

    editOnlyElements.forEach((element) => {
        element.classList.toggle(
            "hidden",
            !isEditing
        );
    });
}

function showModal() {
    modal.classList.add("visible");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );

    setTimeout(() => {
        titleInput.focus();
    }, 100);
}

function openCreateModal() {
    planForm.reset();

    planIdInput.value = "";
    totalTopicsInput.value = 10;
    completedTopicsInput.value = 0;
    statusInput.value = "active";
    formMessage.textContent = "";

    setModalMode("create");
    showModal();
}

async function openEditModal(planId) {
    formMessage.textContent = "";

    try {
        const response = await fetch(
            `/api/study-plans/${planId}`
        );

        const result = await response.json();

        if (response.status === 401) {
            window.location.href = "/signin";
            return;
        }

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Unable to load the study plan."
            );
        }

        const plan = result.plan;

        planIdInput.value = plan._id;
        titleInput.value = plan.title;
        subjectInput.value = plan.subject;
        descriptionInput.value =
            plan.description || "";

        totalTopicsInput.value =
            plan.totalTopics;

        completedTopicsInput.value =
            plan.completedTopics;

        completedTopicsInput.max =
            plan.totalTopics;

        statusInput.value = plan.status;

        setModalMode("edit");
        showModal();
    } catch (error) {
        console.error(
            "Open study plan error:",
            error
        );

        showToast(
            error.message,
            "error"
        );
    }
}

function closePlanModal() {
    modal.classList.remove("visible");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );

    planForm.reset();

    planIdInput.value = "";
    totalTopicsInput.value = 10;
    completedTopicsInput.value = 0;
    completedTopicsInput.removeAttribute(
        "max"
    );

    statusInput.value = "active";
    formMessage.textContent = "";

    setModalMode("create");
}

function createPlanCard(plan) {
    const progress =
        calculateProgress(plan);

    const article =
        document.createElement("article");

    article.className = "plan-card";
    article.dataset.planId = plan._id;

    article.innerHTML = `
        <div class="plan-card-top">
            <span class="plan-category">
                ${escapeHtml(plan.subject)}
            </span>

            <span
                class="plan-status ${escapeHtml(
                    plan.status
                )}"
            >
                ${escapeHtml(plan.status)}
            </span>
        </div>

        <h3>
            ${escapeHtml(plan.title)}
        </h3>

        <p>
            ${
                plan.description
                    ? escapeHtml(
                        plan.description
                    )
                    : "No description provided."
            }
        </p>

        <div class="plan-progress">
            <div class="progress-header">
                <span>
                    ${plan.completedTopics}
                    of
                    ${plan.totalTopics}
                    topics
                </span>

                <strong>
                    ${progress}%
                </strong>
            </div>

            <div class="progress-bar">
                <span
                    style="width: ${progress}%"
                ></span>
            </div>
        </div>

        <div class="plan-footer">
            <span>
                Updated
                ${formatUpdatedDate(
                    plan.updatedAt
                )}
            </span>

            <button
                class="plan-open-button"
                type="button"
                data-plan-id="${escapeHtml(
                    plan._id
                )}"
            >
                Open
            </button>
        </div>
    `;

    const openButton =
        article.querySelector(
            ".plan-open-button"
        );

    openButton.addEventListener(
        "click",
        () => {
            loadPlanForViewer(plan._id);
        }
    );

    return article;
}

function createNewPlanCard() {
    const button =
        document.createElement("button");

    button.className = "new-plan-card";
    button.type = "button";

    button.innerHTML = `
        <span class="new-plan-icon">
            +
        </span>

        <strong>
            Create a new study plan
        </strong>

        <span>
            Organize a new subject or goal.
        </span>
    `;

    button.addEventListener(
        "click",
        openCreateModal
    );

    return button;
}

function renderStudyPlans(plans) {
    plansGrid.innerHTML = "";

    if (plans.length === 0) {
        plansGrid.innerHTML = `
            <div class="plans-empty">
                <strong>
                    No study plans yet
                </strong>

                <span>
                    Create your first plan to start organizing your learning.
                </span>

                <button
                    class="button"
                    id="first-plan-button"
                    type="button"
                >
                    + Create First Plan
                </button>
            </div>
        `;

        document
            .getElementById(
                "first-plan-button"
            )
            .addEventListener(
                "click",
                openCreateModal
            );

        return;
    }

    plans.forEach((plan) => {
        plansGrid.appendChild(
            createPlanCard(plan)
        );
    });

    plansGrid.appendChild(
        createNewPlanCard()
    );
}

export async function loadStudyPlans() {
    try {
        const response = await fetch(
            "/api/study-plans"
        );

        const result = await response.json();

        if (response.status === 401) {
            window.location.href = "/signin";
            return;
        }

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Unable to load study plans."
            );
        }

        renderStudyPlans(result.plans);
        updateOverview(result.plans);
    } catch (error) {
        console.error(
            "Load study plans error:",
            error
        );

        updateOverview([]);

        plansGrid.innerHTML = `
            <div class="plans-empty">
                <strong>
                    Unable to load study plans
                </strong>

                <span>
                    ${escapeHtml(error.message)}
                </span>
            </div>
        `;
    }
}

function getPlanData() {
    return {
        title: titleInput.value.trim(),

        subject:
            subjectInput.value.trim(),

        description:
            descriptionInput.value.trim(),

        totalTopics: Number(
            totalTopicsInput.value
        ),

        completedTopics: Number(
            completedTopicsInput.value
        ),

        status: statusInput.value
    };
}

async function createStudyPlan(planData) {
    const response = await fetch(
        "/api/study-plans",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                title: planData.title,
                subject: planData.subject,
                description:
                    planData.description,
                totalTopics:
                    planData.totalTopics
            })
        }
    );

    const result = await response.json();

    if (response.status === 401) {
        window.location.href = "/signin";
        return;
    }

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Unable to create study plan."
        );
    }

    return result.plan;
}

async function updateStudyPlan(
    planId,
    planData
) {
    const response = await fetch(
        `/api/study-plans/${planId}`,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify(planData)
        }
    );

    const result = await response.json();

    if (response.status === 401) {
        window.location.href = "/signin";
        return;
    }

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Unable to update study plan."
        );
    }

    return result.plan;
}

async function deleteStudyPlan(planId) {
    const response = await fetch(
        `/api/study-plans/${planId}`,
        {
            method: "DELETE"
        }
    );

    const result = await response.json();

    if (response.status === 401) {
        window.location.href = "/signin";
        return;
    }

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Unable to delete study plan."
        );
    }

    return result;
}

function validatePlanData(planData) {
    if (
        planData.completedTopics >
        planData.totalTopics
    ) {
        throw new Error(
            "Completed topics cannot be greater than total topics."
        );
    }

    if (
        planData.completedTopics < 0 ||
        planData.totalTopics < 1
    ) {
        throw new Error(
            "Topic values are not valid."
        );
    }
}

function initializePlanForm() {
    planForm.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            formMessage.textContent = "";

            if (!planForm.checkValidity()) {
                planForm.reportValidity();
                return;
            }

            submitButton.disabled = true;

            submitButton.textContent =
                modalMode === "edit"
                    ? "Saving..."
                    : "Creating...";

            try {
                const planData =
                    getPlanData();

                if (modalMode === "edit") {
                    validatePlanData(
                        planData
                    );

                    await updateStudyPlan(
                        planIdInput.value,
                        planData
                    );

                    showToast(
                        "Study plan updated successfully."
                    );
                } else {
                    await createStudyPlan(
                        planData
                    );

                    showToast(
                        "Study plan created successfully."
                    );
                }

                closePlanModal();
                await loadStudyPlans();
            } catch (error) {
                console.error(
                    "Save study plan error:",
                    error
                );

                formMessage.textContent =
                    error.message;

                showToast(
                    error.message,
                    "error"
                );
            } finally {
                submitButton.disabled = false;

                submitButton.textContent =
                    modalMode === "edit"
                        ? "Save Changes"
                        : "Create Plan";
            }
        }
    );
}

function openDeleteModal() {
    const planId = planIdInput.value;
    const planTitle = titleInput.value.trim();

    if (!planId) {
        return;
    }

    planIdPendingDeletion = planId;

    deletePlanName.textContent =
        planTitle || "this study plan";

    deleteModal.classList.add("visible");

    deleteModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );

    setTimeout(() => {
        deleteCancelButton.focus();
    }, 100);
}

function closeDeleteModal() {
    deleteModal.classList.remove("visible");

    deleteModal.setAttribute(
        "aria-hidden",
        "true"
    );

    planIdPendingDeletion = null;

    if (
        modal.classList.contains("visible")
    ) {
        document.body.classList.add(
            "modal-open"
        );
    } else {
        document.body.classList.remove(
            "modal-open"
        );
    }

    deleteConfirmButton.disabled = false;
    deleteConfirmButton.textContent =
        "Delete Plan";
}

function initializeDeleteButton() {
    deleteButton.addEventListener(
        "click",
        openDeleteModal
    );

    deleteCancelButton.addEventListener(
        "click",
        closeDeleteModal
    );

    deleteModal.addEventListener(
        "click",
        (event) => {
            if (event.target === deleteModal) {
                closeDeleteModal();
            }
        }
    );

    deleteConfirmButton.addEventListener(
        "click",
        async () => {
            if (!planIdPendingDeletion) {
                return;
            }

            deleteConfirmButton.disabled = true;
            deleteConfirmButton.textContent =
                "Deleting...";

            try {
                await deleteStudyPlan(
                    planIdPendingDeletion
                );

                closeDeleteModal();
                closePlanModal();

                await loadStudyPlans();

                showToast(
                    "Study plan deleted successfully."
                );
            } catch (error) {
                console.error(
                    "Delete study plan error:",
                    error
                );

                closeDeleteModal();

                formMessage.textContent =
                    error.message;

                showToast(
                    error.message,
                    "error"
                );
            } finally {
                deleteConfirmButton.disabled =
                    false;

                deleteConfirmButton.textContent =
                    "Delete Plan";
            }
        }
    );
}

function initializeTopicValidation() {
    totalTopicsInput.addEventListener(
        "input",
        () => {
            completedTopicsInput.max =
                totalTopicsInput.value;
        }
    );

    completedTopicsInput.addEventListener(
        "input",
        () => {
            const total = Number(
                totalTopicsInput.value
            );

            const completed = Number(
                completedTopicsInput.value
            );

            if (completed > total) {
                completedTopicsInput.setCustomValidity(
                    "Completed topics cannot exceed total topics."
                );
            } else {
                completedTopicsInput.setCustomValidity(
                    ""
                );
            }
        }
    );
}

function initializePlanModal() {
    const headerNewPlanButton =
        document.getElementById(
            "new-plan-button"
        );

    headerNewPlanButton?.addEventListener(
        "click",
        openCreateModal
    );

    modalCloseButton?.addEventListener(
        "click",
        closePlanModal
    );

    cancelButton?.addEventListener(
        "click",
        closePlanModal
    );

    modal?.addEventListener(
        "click",
        (event) => {
            if (event.target === modal) {
                closePlanModal();
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
                deleteModal.classList.contains(
                    "visible"
                )
            ) {
                closeDeleteModal();
                return;
            }

            if (
                planViewModal.classList.contains(
                    "visible"
                )
            ) {
                closePlanViewModal();
                return;
            }

            if (
                modal.classList.contains(
                    "visible"
                )
            ) {
                closePlanModal();
            }
        }
    );
}

function getPlanProgress(plan) {
    const topics =
        Array.isArray(plan.topics)
            ? plan.topics
            : [];

    const total =
        topics.length > 0
            ? topics.length
            : Number(plan.totalTopics) || 0;

    const completed =
        topics.length > 0
            ? topics.filter(
                (topic) =>
                    topic.completed === true
            ).length
            : Number(
                plan.completedTopics
            ) || 0;

    const percent =
        total > 0
            ? Math.round(
                (completed / total) * 100
            )
            : 0;

    return {
        total,
        completed,
        percent
    };
}

function groupPlanTopics(topics) {
    return topics.reduce(
        (weeks, topic) => {
            const week =
                Number(topic.week) || 1;

            if (!weeks[week]) {
                weeks[week] = [];
            }

            weeks[week].push(topic);

            return weeks;
        },
        {}
    );
}

function renderPlanViewer(plan) {
    const {
        total,
        completed,
        percent
    } = getPlanProgress(plan);

    planViewLabel.textContent =
        plan.source === "ai"
            ? "AI generated study plan"
            : "Study plan";

    planViewTitle.textContent =
        plan.title;

    planViewSubject.textContent =
        plan.subject;

    planViewDuration.textContent =
        `${plan.durationWeeks || 1} ${
            Number(plan.durationWeeks) === 1
                ? "week"
                : "weeks"
        }`;

    planViewStatus.textContent =
        plan.status;

    planViewStatus.className =
        `plan-status ${plan.status}`;

    planViewDescription.textContent =
        plan.description ||
        "No description provided.";

    planViewProgressText.textContent =
        `${completed} of ${total} topics`;

    planViewProgressPercent.textContent =
        `${percent}%`;

    planViewProgressBar.style.width =
        `${percent}%`;

    planViewContent.innerHTML = "";

    const topics =
        Array.isArray(plan.topics)
            ? plan.topics
            : [];

    if (topics.length === 0) {
        planViewContent.innerHTML = `
            <div class="plan-view-empty">
                <strong>
                    No detailed topics
                </strong>

                <p>
                    This manual plan contains progress totals,
                    but it does not have an individual topic list.
                    You can still edit its completed topic count.
                </p>
            </div>
        `;

        return;
    }

    const groupedTopics =
        groupPlanTopics(topics);

    const weekNumbers =
        Object.keys(groupedTopics)
            .map(Number)
            .sort((a, b) => a - b);

    weekNumbers.forEach((weekNumber) => {
        const weekTopics =
            groupedTopics[weekNumber];

        const completedInWeek =
            weekTopics.filter(
                (topic) =>
                    topic.completed === true
            ).length;

        const weekElement =
            document.createElement(
                "section"
            );

        weekElement.className =
            "plan-view-week";

        const topicsHtml =
            weekTopics
                .map((topic) => {
                    const topicId =
                        String(topic._id);

                    const topicTitle =
                        topic.title ||
                        "Untitled topic";

                    const topicDescription =
                        topic.description ||
                        "No description provided.";

                    return `
                        <article
                            class="plan-view-topic ${
                                topic.completed
                                    ? "completed"
                                    : ""
                            }"
                            data-topic-id="${escapeHtml(
                                topicId
                            )}"
                        >
                            <label
                                class="topic-complete-control"
                                aria-label="Mark ${escapeHtml(
                                    topicTitle
                                )} as completed"
                            >
                                <input
                                    type="checkbox"
                                    ${
                                        topic.completed
                                            ? "checked"
                                            : ""
                                    }
                                >

                                <span class="plan-topic-checkbox">
                                    ${
                                        topic.completed
                                            ? "✓"
                                            : ""
                                    }
                                </span>
                            </label>

                            <div class="plan-topic-content">
                                <strong>
                                    ${escapeHtml(
                                        topicTitle
                                    )}
                                </strong>

                                <p>
                                    ${escapeHtml(
                                        topicDescription
                                    )}
                                </p>
                            </div>

                            <button
                                class="take-quiz-button"
                                type="button"
                                data-topic-id="${escapeHtml(
                                    topicId
                                )}"
                                data-topic-title="${escapeHtml(
                                    topicTitle
                                )}"
                            >
                                ${
                                    topic.completed
                                        ? "Retake Quiz"
                                        : "Take Quiz"
                                }
                            </button>
                        </article>
                    `;
                })
                .join("");

        weekElement.innerHTML = `
            <div class="plan-view-week-header">
                <h3>
                    Week ${weekNumber}
                </h3>

                <span>
                    ${completedInWeek}
                    of
                    ${weekTopics.length}
                    completed
                </span>
            </div>

            <div class="plan-view-topic-list">
                ${topicsHtml}
            </div>
        `;

        planViewContent.appendChild(
            weekElement
        );
    });

    initializeTopicCheckboxes();
}

function refreshOpenPlanViewer(plan) {
    const previousScrollTop =
        planViewContent.scrollTop;

    renderPlanViewer(plan);

    requestAnimationFrame(() => {
        /*
            Внутренний список возвращаем
            на прежнюю позицию.
        */
        planViewContent.scrollTop =
            Math.min(
                previousScrollTop,
                planViewContent.scrollHeight -
                    planViewContent.clientHeight
            );

        /*
            Сама modal не должна быть прокручена.
        */
        const modalElement =
            document.querySelector(
                "#plan-view-modal .plan-view-modal"
            );

        if (modalElement) {
            modalElement.scrollTop = 0;
        }
    });
}

function openPlanViewModal() {
    planViewModal.classList.add(
        "visible"
    );

    planViewModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );

    planViewMessage.textContent = "";
}

function closePlanViewModal() {
    planViewModal.classList.remove(
        "visible"
    );

    planViewModal.setAttribute(
        "aria-hidden",
        "true"
    );

    currentViewedPlan = null;
    planViewMessage.textContent = "";

    document.body.classList.remove(
        "modal-open"
    );
}

async function loadPlanForViewer(planId) {
    try {
        const response = await fetch(
            `/api/study-plans/${planId}`
        );

        const result =
            await response.json();

        if (response.status === 401) {
            window.location.href =
                "/signin";
            return;
        }

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Unable to load the study plan."
            );
        }

        currentViewedPlan =
            result.plan;

        renderPlanViewer(
            currentViewedPlan
        );

        openPlanViewModal();
    } catch (error) {
        console.error(
            "Load plan viewer error:",
            error
        );

        showToast(
            error.message,
            "error"
        );
    }
}

async function updateTopicStatus(
    planId,
    topicId,
    completed
) {
    const response = await fetch(
        `/api/study-plans/${planId}/topics/${topicId}`,
        {
            method: "PATCH",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                completed
            })
        }
    );

    const result =
        await response.json();

    if (response.status === 401) {
        window.location.href =
            "/signin";

        return null;
    }

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Unable to update the topic."
        );
    }

    return result.plan;
}

function initializeTopicCheckboxes() {
    const topicElements =
        planViewContent.querySelectorAll(
            ".plan-view-topic"
        );

    topicElements.forEach(
        (topicElement) => {
            const checkbox =
                topicElement.querySelector(
                    "input[type='checkbox']"
                );

            const quizButton =
                topicElement.querySelector(
                    ".take-quiz-button"
                );

            checkbox?.addEventListener(
                "change",
                async () => {
                    if (!currentViewedPlan) {
                        return;
                    }

                    const topicId =
                        topicElement.dataset
                            .topicId;

                    const newCompletedValue =
                        checkbox.checked;

                    topicElement.classList.add(
                        "updating"
                    );

                    try {
                        const updatedPlan =
                            await updateTopicStatus(
                                currentViewedPlan._id,
                                topicId,
                                newCompletedValue
                            );

                        if (!updatedPlan) {
                            return;
                        }

                        currentViewedPlan =
                            updatedPlan;

                        refreshOpenPlanViewer(
                            currentViewedPlan
                        );

                        await loadStudyPlans();

                        showToast(
                            newCompletedValue
                                ? "Topic marked as completed."
                                : "Topic marked as incomplete."
                        );
                    } catch (error) {
                        checkbox.checked =
                            !newCompletedValue;

                        showToast(
                            error.message,
                            "error"
                        );
                    } finally {
                        topicElement.classList.remove(
                            "updating"
                        );
                    }
                }
            );

            quizButton?.addEventListener(
                "click",
                async () => {
                    if (!currentViewedPlan) {
                        return;
                    }

                    await startTopicQuiz({
                        planId:
                            currentViewedPlan._id,

                        topicId:
                            quizButton.dataset
                                .topicId,

                        topicTitle:
                            quizButton.dataset
                                .topicTitle,

                        onComplete:
                            async (
                                updatedPlan
                            ) => {
                                currentViewedPlan =
                                    updatedPlan;

                                renderPlanViewer(
                                    currentViewedPlan
                                );
                            }
                    });
                }
            );
        }
    );
}

function initializePlanViewer() {
    planViewClose.addEventListener(
        "click",
        closePlanViewModal
    );

    planViewCloseButton.addEventListener(
        "click",
        closePlanViewModal
    );

    planViewModal.addEventListener(
        "click",
        (event) => {
            if (
                event.target ===
                planViewModal
            ) {
                closePlanViewModal();
            }
        }
    );

    planViewEditButton.addEventListener(
        "click",
        () => {
            if (!currentViewedPlan) {
                return;
            }

            const planId =
                currentViewedPlan._id;

            closePlanViewModal();

            openEditModal(planId);
        }
    );

    planViewDeleteButton.addEventListener(
        "click",
        () => {
            if (!currentViewedPlan) {
                return;
            }

            planIdInput.value =
                currentViewedPlan._id;

            titleInput.value =
                currentViewedPlan.title;

            closePlanViewModal();
            openDeleteModal();
        }
    );
}

export function initializeStudyPlans() {
    initializePlanModal();
    initializePlanViewer();
    initializePlanForm();
    initializeDeleteButton();
    initializeTopicValidation();
    loadStudyPlans();
}