const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [
                true,
                "Username is required."
            ],
            trim: true,
            minlength: [
                3,
                "Username must contain at least 3 characters."
            ],
            maxlength: [
                30,
                "Username cannot exceed 30 characters."
            ]
        },

        email: {
            type: String,
            required: [
                true,
                "Email is required."
            ],
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: [
                true,
                "Password is required."
            ],
            minlength: [
                8,
                "Password must contain at least 8 characters."
            ],
            select: false
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;