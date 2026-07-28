const express =
    require("express");

const {
    generateQuiz,
    submitQuiz
} = require(
    "../controllers/quizController"
);

const requireApiAuth =
    require(
        "../middleware/requireApiAuth"
    );

const router =
    express.Router();

router.post(
    "/generate",
    requireApiAuth,
    generateQuiz
);

router.post(
    "/:quizId/submit",
    requireApiAuth,
    submitQuiz
);

module.exports = router;