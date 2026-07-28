StudyPilot AI

StudyPilot AI is a full-stack web application that helps users create personalized study plans, track learning progress, and test their knowledge with AI-generated quizzes.

The application combines a traditional study-planning dashboard with Google Gemini AI. Instead of only generating a study plan once, StudyPilot AI stores the plan, organizes topics by week, tracks completed topics, and generates topic-specific quizzes.

Live Application

StudyPilot AI is deployed on Render:

https://studypilot-ai-ddhw.onrender.com

Main Features

User Authentication

User registration

User sign-in

User sign-out

Password hashing with bcrypt

Session-based authentication

Protected dashboard routes

Persistent sessions stored in MongoDB

User-specific study plans and quizzes

Study Plan Management

Create a study plan manually

Edit an existing study plan

Delete a study plan

View a complete study plan in a modal window

Organize topics by week

Track completed and remaining topics

Display plan status, duration, subject, and progress

Automatically calculate completion percentage

Mark topics as completed or incomplete

Display active plans, completed topics, and overall progress on the dashboard

AI-Generated Study Plans

Generate personalized study plans with Google Gemini

Select a subject, learning goal, level, and duration

Preview the generated plan before saving

Save AI-generated plans to MongoDB

Generate weekly topics with descriptions

Store the AI-generated plan as a regular editable study plan

AI-Generated Quizzes

Generate a five-question quiz for an individual study topic

Generate four answer choices for every question

Present quiz questions one at a time

Prevent quiz submission until all questions are answered

Check quiz answers on the server

Display the score, correct answers, and explanations

Require a score of at least 70% to pass

Automatically mark a topic as completed after a passing score

Store quiz attempts, best score, and pass status

Reuse an existing quiz instead of generating a new quiz every time

Allow users to retake quizzes

Dashboard and User Interface

Responsive dashboard layout

Sidebar navigation

Overview cards with real database data

Current study goal

Study plan cards

Progress bars

Loading states

Toast notifications

Confirmation modal before deleting a plan

Separate modals for creating, editing, viewing, generating, and completing quizzes

Mobile-friendly layout

Technologies Used

Frontend

HTML5

CSS3

JavaScript

ES Modules

Fetch API

Backend

Node.js

Express.js

Express Session

Connect Mongo

bcrypt

Database

MongoDB Atlas

Mongoose

Artificial Intelligence API

Google Gemini API

@google/genai

Deployment

GitHub

Render

MongoDB Atlas

Project Structure

study-pilot-ai/
├── public/
│   ├── css/
│   │   ├── global.css
│   │   ├── auth.css
│   │   └── dashboard.css
│   ├── js/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── studyPlans.js
│   │   ├── overview.js
│   │   ├── ai.js
│   │   ├── quiz.js
│   │   ├── ui.js
│   │   ├── signin.js
│   │   └── signup.js
│   ├── index.html
│   ├── signup.html
│   ├── signin.html
│   └── dashboard.html
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studyPlanController.js
│   │   ├── aiController.js
│   │   └── quizController.js
│   ├── middleware/
│   │   ├── requireAuth.js
│   │   └── requireApiAuth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── StudyPlan.js
│   │   └── Quiz.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studyPlanRoutes.js
│   │   ├── aiRoutes.js
│   │   └── quizRoutes.js
│   └── services/
│       └── geminiService.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js

API Used

StudyPilot AI uses the Google Gemini API to generate:

Personalized study plans

Weekly study topics

Topic descriptions

Multiple-choice quizzes

Correct-answer explanations

The application uses the official Google GenAI Node.js package:

@google/genai

The Gemini model is configured with the GEMINI_MODEL environment variable.

Database Schema

The application uses MongoDB Atlas with Mongoose.

User Schema

The User collection stores registered users.

User
├── _id: ObjectId
├── name: String
├── email: String
├── password: String or passwordHash
├── createdAt: Date
└── updatedAt: Date

Important behavior:

Email addresses are unique.

Passwords are hashed with bcrypt before being stored.

Password values are never returned to the frontend.

StudyPlan Schema

The StudyPlan collection stores both manually created and AI-generated plans.

StudyPlan
├── _id: ObjectId
├── userId: ObjectId
├── title: String
├── subject: String
├── description: String
├── durationWeeks: Number
├── status: String
├── source: String
├── topics: Array
│   ├── _id: ObjectId
│   ├── week: Number
│   ├── title: String
│   ├── description: String
│   └── completed: Boolean
├── createdAt: Date
└── updatedAt: Date

Important behavior:

Every plan belongs to one authenticated user.

The source field identifies whether the plan was created manually or generated by AI.

Topics are grouped by week.

Topic completion is used to calculate plan progress.

Quiz Schema

The Quiz collection stores generated quizzes and quiz progress.

Quiz
├── _id: ObjectId
├── userId: ObjectId
├── planId: ObjectId
├── topicId: ObjectId
├── topicTitle: String
├── questions: Array
│   ├── _id: ObjectId
│   ├── question: String
│   ├── options: Array<String>
│   ├── correctOptionIndex: Number
│   └── explanation: String
├── attempts: Number
├── bestScore: Number
├── passed: Boolean
├── lastAttemptAt: Date
├── createdAt: Date
└── updatedAt: Date

Important behavior:

A quiz belongs to a user, study plan, and topic.

Every quiz contains five questions.

Every question contains four options.

Correct answers remain on the server until the quiz is submitted.

A score of 70% or higher passes the quiz.

Passing a quiz automatically completes the related topic.

The combination of userId, planId, and topicId is unique, so the same generated quiz can be reused.

Session Collection

User sessions are stored in MongoDB by connect-mongo.

sessions
├── _id
├── session
└── expires

This allows login sessions to remain available across server restarts and deployment instances.

API Routes

Authentication

POST /api/auth/signup
POST /api/auth/signin
POST /api/auth/signout
GET  /api/auth/me

Study Plans

GET    /api/study-plans
POST   /api/study-plans
PUT    /api/study-plans/:planId
DELETE /api/study-plans/:planId
PATCH  /api/study-plans/:planId/topics/:topicId

AI

POST /api/ai/generate-plan

Quizzes

POST /api/quizzes/generate
POST /api/quizzes/:quizId/submit

Health Check

GET /api/health

How to Run the Server Locally

1. Install Node.js

Install a current version of Node.js and npm.

Check that they are available:

node --version
npm --version

2. Clone the Repository

git clone https://github.com/Egoschenkov/StudyPilot-AI.git
cd StudyPilot-AI

3. Install Dependencies

npm install

4. Create the Environment File

Create a .env file in the project root.

You can copy the provided example:

copy .env.example .env

On macOS or Linux:

cp .env.example .env

Add the following variables:

PORT=3000
MONGODB_URI=your_mongodb_atlas_connection_string
SESSION_SECRET=your_long_random_session_secret
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=your_supported_gemini_model
NODE_ENV=development

Do not commit the .env file to GitHub.

5. Configure MongoDB Atlas

In MongoDB Atlas:

Create a database user.

Copy the MongoDB connection string.

Add your current IP address to the Atlas IP Access List.

Place the connection string in MONGODB_URI.

6. Start the Development Server

npm run dev

The server will restart automatically when source files change.

7. Start the Production Server

npm start

The application will be available at:

http://localhost:3000

Environment Variables

Variable

Description

PORT

Port used by the Express server

MONGODB_URI

MongoDB Atlas connection string

SESSION_SECRET

Secret used to sign session cookies

GEMINI_API_KEY

Google Gemini API key

GEMINI_MODEL

Gemini model used for plan and quiz generation

NODE_ENV

Application environment, such as development or production

Available npm Commands

npm run dev

Starts the server with Nodemon for local development.

npm start

Starts the application with Node.js.

Security

Passwords are hashed with bcrypt.

Authentication is session-based.

Sessions are stored in MongoDB.

Session cookies are HTTP-only.

Secure cookies are enabled in production.

API routes verify that a user is authenticated.

Study plans and quizzes are queried by both resource ID and user ID.

Gemini API keys and database credentials are stored in environment variables.

Correct quiz answers are not sent to the browser before submission.

The .env file is excluded from Git with .gitignore.

Deployment

The application is deployed as a Node.js Web Service on Render.

Render configuration:

Build Command: npm install
Start Command: npm start

Production environment variables are configured in the Render dashboard.

MongoDB Atlas must allow connections from the deployed service. For this academic deployment, Atlas can be configured with:

0.0.0.0/0

Database access still requires the valid MongoDB username and password contained in MONGODB_URI.

Future Improvements

Possible future improvements include:

AI tutor chat with plan and topic context

Adaptive study-plan rescheduling

Recommended next topic after each quiz

Weak-topic analysis

Quiz history page

Additional question types

Email reminders

Password reset

OAuth authentication

Custom user profiles

Author

Ilya Yahoshchankau

Computer Science student project for CSCI 355.