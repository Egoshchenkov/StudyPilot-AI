const express = require("express");

const requireApiAuth =
    require("../middleware/requireApiAuth");

const {
    getStudyPlans,
    getStudyPlanById,
    createStudyPlan,
    createAiStudyPlan,
    updateStudyPlan,
    updateStudyTopic,
    deleteStudyPlan
} = require(
    "../controllers/studyPlanController"
);

const router = express.Router();

router.use(requireApiAuth);

router.get("/", getStudyPlans);

router.post(
    "/ai",
    requireApiAuth,
    createAiStudyPlan
);

router.get("/:id", getStudyPlanById);

router.post("/", createStudyPlan);

router.put("/:id", updateStudyPlan);

router.patch(
    "/:planId/topics/:topicId",
    requireApiAuth,
    updateStudyTopic
);

router.delete("/:id", deleteStudyPlan);

module.exports = router;