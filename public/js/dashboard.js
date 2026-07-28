import {
    loadCurrentUser,
    initializeSignOut
} from "./auth.js";

import {
    displayCurrentDate,
    initializeSidebar,
    initializeSectionNavigation,
    showToast
} from "./ui.js";

import {
    initializeStudyPlans
} from "./studyPlans.js";

import {
    initializeAi
} from "./ai.js";

import {
    initializeOverview
} from "./overview.js";

import {
    initializeQuiz
} from "./quiz.js";

function initializeDashboard() {
    displayCurrentDate();
    initializeSidebar();
    initializeSectionNavigation();
    initializeOverview();
    initializeSignOut();
    initializeAi();
    initializeStudyPlans();
    initializeQuiz();
    loadCurrentUser();
}

initializeDashboard();