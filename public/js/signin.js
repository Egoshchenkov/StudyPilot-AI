const signinForm =
    document.getElementById("signin-form");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const rememberMeInput =
    document.getElementById("remember-me");

const signinButton =
    document.getElementById("signin-button");

const formMessage =
    document.getElementById("form-message");

function showFieldError(
    input,
    errorElementId,
    message
) {
    input.classList.add("invalid");

    const errorElement =
        document.getElementById(errorElementId);

    errorElement.textContent = message;
}

function clearFieldError(
    input,
    errorElementId
) {
    input.classList.remove("invalid");

    const errorElement =
        document.getElementById(errorElementId);

    errorElement.textContent = "";
}

function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className =
        `form-message visible ${type}`;
}

function clearFormMessage() {
    formMessage.textContent = "";
    formMessage.className = "form-message";
}

function isValidEmail(email) {
    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);
}

function validateSigninForm() {
    let isValid = true;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    clearFormMessage();

    if (!isValidEmail(email)) {
        showFieldError(
            emailInput,
            "email-error",
            "Enter a valid email address."
        );

        isValid = false;
    } else {
        clearFieldError(
            emailInput,
            "email-error"
        );
    }

    if (password === "") {
        showFieldError(
            passwordInput,
            "password-error",
            "Password is required."
        );

        isValid = false;
    } else {
        clearFieldError(
            passwordInput,
            "password-error"
        );
    }

    return isValid;
}

signinForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        if (!validateSigninForm()) {
            showFormMessage(
                "Please enter your email and password.",
                "error"
            );

            return;
        }

        signinButton.disabled = true;
        signinButton.textContent = "Signing In...";

        const credentials = {
            email: emailInput.value
                .trim()
                .toLowerCase(),

            password: passwordInput.value,

            rememberMe:
                rememberMeInput.checked
        };

        try {
            const response = await fetch(
                "/api/auth/signin",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(
                        credentials
                    )
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Unable to sign in."
                );
            }

            showFormMessage(
                result.message,
                "success"
            );

            window.location.href =
                "/dashboard";
        } catch (error) {
            showFormMessage(
                error.message,
                "error"
            );
        } finally {
            signinButton.disabled = false;
            signinButton.textContent =
                "Sign In";
        }
    }
);

document
    .querySelectorAll(
        "[data-password-toggle]"
    )
    .forEach((button) => {
        button.addEventListener(
            "click",
            () => {
                const inputId =
                    button.dataset.passwordToggle;

                const input =
                    document.getElementById(
                        inputId
                    );

                const isPassword =
                    input.type === "password";

                input.type =
                    isPassword
                        ? "text"
                        : "password";

                button.textContent =
                    isPassword
                        ? "Hide"
                        : "Show";

                button.setAttribute(
                    "aria-label",
                    isPassword
                        ? "Hide password"
                        : "Show password"
                );
            }
        );
    });