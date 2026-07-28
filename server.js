const path = require("path");
const express = require("express");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");

require("dotenv").config();

const connectDatabase =
    require("./src/config/database");

const authRoutes =
    require("./src/routes/authRoutes");

const studyPlanRoutes =
    require("./src/routes/studyPlanRoutes");

const requireAuth =
    require("./src/middleware/requireAuth");

const aiRoutes =
    require("./src/routes/aiRoutes");

const quizRoutes =
    require(
        "./src/routes/quizRoutes"
    );

const app = express();

const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1);

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    session({
        name: "studypilot.sid",

        secret: process.env.SESSION_SECRET,

        resave: false,

        saveUninitialized: false,

        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            collectionName: "sessions"
        }),

        cookie: {
            httpOnly: true,
            secure:
                process.env.NODE_ENV ===
                "production",
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 2
        }
    })
);

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );
});

app.get("/signin", (req, res) => {
    if (req.session.userId) {
        return res.redirect("/dashboard");
    }

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "signin.html"
        )
    );
});

app.get("/signup", (req, res) => {
    if (req.session.userId) {
        return res.redirect("/dashboard");
    }

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "signup.html"
        )
    );
});

app.get(
    "/dashboard",
    requireAuth,
    (req, res) => {
        res.sendFile(
            path.join(
                __dirname,
                "public",
                "dashboard.html"
            )
        );
    }
);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message:
            "StudyPilot AI server is running."
    });
});

app.use("/api/auth", authRoutes);

app.use(
    "/api/study-plans",
    studyPlanRoutes
);

app.use("/api/ai", aiRoutes);

app.use(
    "/api/quizzes",
    quizRoutes
);

app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found."
    });
});

async function startServer() {
    await connectDatabase();

    app.listen(PORT, () => {
        console.log(
            `StudyPilot AI is running at http://localhost:${PORT}`
        );
    });
}

startServer();