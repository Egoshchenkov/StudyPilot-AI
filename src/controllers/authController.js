const bcrypt = require("bcrypt");
const User = require("../models/User");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function signup(req, res) {
    try {
        const {
            username,
            email,
            password,
            confirmPassword
        } = req.body;

        if (
            !username ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        const normalizedUsername = username.trim();

        const normalizedEmail = email
            .trim()
            .toLowerCase();

        if (normalizedUsername.length < 3) {
            return res.status(400).json({
                success: false,
                message:
                    "Username must contain at least 3 characters."
            });
        }

        if (!EMAIL_PATTERN.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid email address."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 8 characters."
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match."
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists."
            });
        }

        const passwordHash = await bcrypt.hash(
            password,
            12
        );

        const user = await User.create({
            username: normalizedUsername,
            email: normalizedEmail,
            password: passwordHash
        });

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Signup error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Unable to create the account. Please try again."
        });
    }
}

async function signin(req, res) {
    try {
        const {
            email,
            password,
            rememberMe
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email
            .trim()
            .toLowerCase();

        if (!EMAIL_PATTERN.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid email address."
            });
        }

        const user = await User.findOne({
            email: normalizedEmail
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        req.session.userId = user._id.toString();

        if (rememberMe) {
            req.session.cookie.maxAge =
                1000 * 60 * 60 * 24 * 7;
        }

        return res.status(200).json({
            success: true,
            message: "Signed in successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Signin error:", error);

        return res.status(500).json({
            success: false,
            message:
                "Unable to sign in. Please try again."
        });
    }
}

async function getCurrentUser(req, res) {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: "You are not signed in."
            });
        }

        const user = await User.findById(
            req.session.userId
        );

        if (!user) {
            req.session.destroy(() => {});

            return res.status(401).json({
                success: false,
                message: "User account was not found."
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error(
            "Current user error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to retrieve the current user."
        });
    }
}

function signout(req, res) {
    req.session.destroy((error) => {
        if (error) {
            console.error("Signout error:", error);

            return res.status(500).json({
                success: false,
                message:
                    "Unable to sign out. Please try again."
            });
        }

        res.clearCookie("studypilot.sid");

        return res.status(200).json({
            success: true,
            message: "Signed out successfully."
        });
    });
}

module.exports = {
    signup,
    signin,
    signout,
    getCurrentUser
};