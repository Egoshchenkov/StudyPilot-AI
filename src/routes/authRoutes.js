const express = require("express");

const {
    signup,
    signin,
    signout,
    getCurrentUser
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout", signout);
router.get("/me", getCurrentUser);

module.exports = router;