const signupForm = document.getElementById("signup-form");

const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById(
    "confirm-password"
);
const termsInput = document.getElementById("terms");

const formMessage = document.getElementById("form-message");

function showFieldError(input, errorElementId, message) {
    input.classList.add("invalid");

    const errorElement = document.getElementById(errorElementId);
    errorElement.textContent = message;
}

function clearFieldError(input, errorElementId) {
    input.classList.remove("invalid");

    const errorElement = document.getElementById(errorElementId);
    errorElement.textContent = "";
}

function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message visible ${type}`;
}

function clearFormMessage() {
    formMessage.textContent = "";
    formMessage.className = "form-message";
}

function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);
}

function validateSignupForm() {
    let isValid = true;

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    clearFormMessage();

    if (username.length < 3) {
        showFieldError(
            usernameInput,
            "username-error",
            "Username must contain at least 3 characters."
        );

        isValid = false;
    } else {
        clearFieldError(usernameInput, "username-error");
    }

    if (!isValidEmail(email)) {
        showFieldError(
            emailInput,
            "email-error",
            "Enter a valid email address."
        );

        isValid = false;
    } else {
        clearFieldError(emailInput, "email-error");
    }

    if (password.length < 8) {
        showFieldError(
            passwordInput,
            "password-error",
            "Password must contain at least 8 characters."
        );

        isValid = false;
    } else {
        clearFieldError(passwordInput, "password-error");
    }

    if (confirmPassword !== password || confirmPassword === "") {
        showFieldError(
            confirmPasswordInput,
            "confirm-password-error",
            "Passwords do not match."
        );

        isValid = false;
    } else {
        clearFieldError(
            confirmPasswordInput,
            "confirm-password-error"
        );
    }

    if (!termsInput.checked) {
        document.getElementById("terms-error").textContent =
            "You must accept the terms to create an account.";

        isValid = false;
    } else {
        document.getElementById("terms-error").textContent = "";
    }

    return isValid;
}

signupForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const isValid = validateSignupForm();

        if (!isValid) {
            showFormMessage(
                "Please correct the highlighted fields.",
                "error"
            );

            return;
        }

        const signupButton =
            document.getElementById("signup-button");

        signupButton.disabled = true;
        signupButton.textContent = "Creating Account...";

        const userData = {
            username: usernameInput.value.trim(),
            email: emailInput.value
                .trim()
                .toLowerCase(),
            password: passwordInput.value,
            confirmPassword:
                confirmPasswordInput.value
        };

        try {
            const response = await fetch(
                "/api/auth/signup",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(userData)
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Unable to create account."
                );
            }

            showFormMessage(
                result.message,
                "success"
            );

            signupForm.reset();

            setTimeout(() => {
                window.location.href = "/signin";
            }, 1000);
        } catch (error) {
            showFormMessage(
                error.message,
                "error"
            );
        } finally {
            signupButton.disabled = false;
            signupButton.textContent =
                "Create Account";
        }
    }
);

document
    .querySelectorAll("[data-password-toggle]")
    .forEach((button) => {
        button.addEventListener("click", () => {
            const inputId = button.dataset.passwordToggle;
            const input = document.getElementById(inputId);

            const isPassword = input.type === "password";

            input.type = isPassword ? "text" : "password";
            button.textContent = isPassword ? "Hide" : "Show";
            button.setAttribute(
                "aria-label",
                isPassword ? "Hide password" : "Show password"
            );
        });
    });