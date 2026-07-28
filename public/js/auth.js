export async function loadCurrentUser() {
    const usernameElement =
        document.getElementById("username");

    const sidebarUsernameElement =
        document.getElementById(
            "sidebar-username"
        );

    const sidebarEmailElement =
        document.getElementById(
            "sidebar-email"
        );

    const sidebarAvatarElement =
        document.getElementById(
            "sidebar-avatar"
        );

    try {
        const response = await fetch(
            "/api/auth/me"
        );

        const result = await response.json();

        if (!response.ok) {
            window.location.href = "/signin";
            return;
        }

        const { username, email } =
            result.user;

        if (usernameElement) {
            usernameElement.textContent =
                username;
        }

        if (sidebarUsernameElement) {
            sidebarUsernameElement.textContent =
                username;
        }

        if (sidebarEmailElement) {
            sidebarEmailElement.textContent =
                email;
        }

        if (sidebarAvatarElement) {
            sidebarAvatarElement.textContent =
                username.charAt(0).toUpperCase();
        }
    } catch (error) {
        console.error(
            "Unable to load user:",
            error
        );

        window.location.href = "/signin";
    }
}

export function initializeSignOut() {
    const signoutButton =
        document.getElementById(
            "signout-button"
        );

    if (!signoutButton) {
        return;
    }

    signoutButton.addEventListener(
        "click",
        async () => {
            signoutButton.disabled = true;
            signoutButton.textContent =
                "Signing Out...";

            try {
                const response = await fetch(
                    "/api/auth/signout",
                    {
                        method: "POST"
                    }
                );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                        "Unable to sign out."
                    );
                }

                window.location.href =
                    "/signin";
            } catch (error) {
                alert(error.message);

                signoutButton.disabled = false;
                signoutButton.textContent =
                    "Sign Out";
            }
        }
    );
}