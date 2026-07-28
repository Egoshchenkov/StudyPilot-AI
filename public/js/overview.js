const activePlansCount =
    document.getElementById(
        "active-plans-count"
    );

const activePlansDetail =
    document.getElementById(
        "active-plans-detail"
    );

const completedTopicsCount =
    document.getElementById(
        "completed-topics-count"
    );

const completedTopicsDetail =
    document.getElementById(
        "completed-topics-detail"
    );

const overallProgressCount =
    document.getElementById(
        "overall-progress-count"
    );

const overallProgressDetail =
    document.getElementById(
        "overall-progress-detail"
    );

const todayGoalTitle =
    document.getElementById(
        "today-goal-title"
    );

const todayGoalDescription =
    document.getElementById(
        "today-goal-description"
    );

const todayGoalPlan =
    document.getElementById(
        "today-goal-plan"
    );

const todayGoalProgress =
    document.getElementById(
        "today-goal-progress"
    );

const todayGoalProgressBar =
    document.getElementById(
        "today-goal-progress-bar"
    );

const continueStudyingButton =
    document.getElementById(
        "continue-studying-button"
    );

let selectedGoalPlanId = null;

function getPlanTopicCounts(plan) {
    if (
        Array.isArray(plan.topics) &&
        plan.topics.length > 0
    ) {
        return {
            total: plan.topics.length,

            completed:
                plan.topics.filter(
                    (topic) =>
                        topic.completed === true
                ).length
        };
    }

    return {
        total: Number(
            plan.totalTopics
        ) || 0,

        completed: Number(
            plan.completedTopics
        ) || 0
    };
}

function calculatePlanProgress(plan) {
    const {
        total,
        completed
    } = getPlanTopicCounts(plan);

    if (total <= 0) {
        return 0;
    }

    return Math.round(
        (completed / total) * 100
    );
}

function findNextTopic(plan) {
    if (
        !Array.isArray(plan.topics)
    ) {
        return null;
    }

    const topics = [...plan.topics].sort(
        (first, second) => {
            const weekDifference =
                Number(first.week) -
                Number(second.week);

            if (weekDifference !== 0) {
                return weekDifference;
            }

            return 0;
        }
    );

    return (
        topics.find(
            (topic) =>
                topic.completed !== true
        ) || null
    );
}

function selectGoalPlan(plans) {
    const activePlans = plans.filter(
        (plan) =>
            plan.status === "active"
    );

    const aiPlanWithNextTopic =
        activePlans.find(
            (plan) =>
                findNextTopic(plan) !== null
        );

    if (aiPlanWithNextTopic) {
        return aiPlanWithNextTopic;
    }

    return (
        activePlans.find((plan) => {
            const {
                total,
                completed
            } = getPlanTopicCounts(plan);

            return completed < total;
        }) || null
    );
}

function renderOverviewStatistics(plans) {
    const activePlans = plans.filter(
        (plan) =>
            plan.status === "active"
    );

    const totals = plans.reduce(
        (result, plan) => {
            const {
                total,
                completed
            } = getPlanTopicCounts(plan);

            result.totalTopics += total;
            result.completedTopics +=
                completed;

            return result;
        },
        {
            totalTopics: 0,
            completedTopics: 0
        }
    );

    const overallProgress =
        totals.totalTopics > 0
            ? Math.round(
                (
                    totals.completedTopics /
                    totals.totalTopics
                ) * 100
            )
            : 0;

    activePlansCount.textContent =
        activePlans.length;

    activePlansDetail.textContent =
        plans.length === 1
            ? "1 plan total"
            : `${plans.length} plans total`;

    completedTopicsCount.textContent =
        totals.completedTopics;

    completedTopicsDetail.textContent =
        totals.totalTopics === 1
            ? "of 1 topic"
            : `of ${totals.totalTopics} topics`;

    overallProgressCount.textContent =
        `${overallProgress}%`;

    const remainingTopics =
        Math.max(
            totals.totalTopics -
            totals.completedTopics,
            0
        );

    overallProgressDetail.textContent =
        remainingTopics === 1
            ? "1 topic remaining"
            : `${remainingTopics} topics remaining`;

    activePlansDetail.classList.toggle(
        "positive",
        activePlans.length > 0
    );

    completedTopicsDetail.classList.toggle(
        "positive",
        totals.completedTopics > 0
    );

    overallProgressDetail.classList.toggle(
        "positive",
        overallProgress > 0
    );
}

function renderTodayGoal(plans) {
    const plan = selectGoalPlan(plans);

    if (!plan) {
        selectedGoalPlanId = null;

        todayGoalTitle.textContent =
            plans.length === 0
                ? "Create your first study plan"
                : "All caught up";

        todayGoalDescription.textContent =
            plans.length === 0
                ? "Create a manual plan or let AI generate one for you."
                : "There are no unfinished topics in your active plans.";

        todayGoalPlan.textContent =
            plans.length === 0
                ? "No study plans yet"
                : "No active topics";

        todayGoalProgress.textContent =
            plans.length === 0
                ? "0%"
                : "100%";

        todayGoalProgressBar.style.width =
            plans.length === 0
                ? "0%"
                : "100%";

        continueStudyingButton.disabled =
            true;

        continueStudyingButton.textContent =
            plans.length === 0
                ? "Create a Plan"
                : "Completed";

        return;
    }

    selectedGoalPlanId = plan._id;

    const nextTopic =
        findNextTopic(plan);

    const progress =
        calculatePlanProgress(plan);

    todayGoalTitle.textContent =
        nextTopic?.title ||
        `Continue ${plan.title}`;

    todayGoalDescription.textContent =
        nextTopic?.description ||
        plan.description ||
        "Continue making progress on this study plan.";

    todayGoalPlan.textContent =
        nextTopic
            ? `${plan.title} · Week ${nextTopic.week}`
            : plan.title;

    todayGoalProgress.textContent =
        `${progress}%`;

    todayGoalProgressBar.style.width =
        `${progress}%`;

    continueStudyingButton.disabled =
        false;

    continueStudyingButton.textContent =
        "Continue Studying";
}

export function updateOverview(plans) {
    const safePlans =
        Array.isArray(plans)
            ? plans
            : [];

    renderOverviewStatistics(
        safePlans
    );

    renderTodayGoal(
        safePlans
    );
}

export function initializeOverview() {
    continueStudyingButton?.addEventListener(
        "click",
        () => {
            if (!selectedGoalPlanId) {
                return;
            }

            const openButton =
                document.querySelector(
                    `.plan-open-button[data-plan-id="${selectedGoalPlanId}"]`
                );

            if (openButton) {
                openButton.click();
                return;
            }

            document
                .getElementById(
                    "study-plans"
                )
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
        }
    );
}