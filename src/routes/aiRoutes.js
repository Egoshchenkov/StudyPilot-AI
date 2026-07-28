const express = require("express");

const {
    generatePlan
} = require("../controllers/aiController");

const requireApiAuth =
    require("../middleware/requireApiAuth");

const router = express.Router();

router.post(
    "/generate-plan",
    requireApiAuth,
    generatePlan
);

module.exports = router;