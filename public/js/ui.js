const toastElement =
    document.getElementById("toast");

let toastTimer;

export function displayCurrentDate() {
    const currentDateElement =
        document.getElementById("current-date");

    if (!currentDateElement) {
        return;
    }

    const today = new Date();

    currentDateElement.textContent =
        today.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric"
        });
}

export function calculateProgress(plan) {
    if (!plan.totalTopics) {
        return 0;
    }

    return Math.round(
        (
            plan.completedTopics /
            plan.totalTopics
        ) * 100
    );
}

export function formatUpdatedDate(dateValue) {
    const date = new Date(dateValue);

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

export function escapeHtml(value) {
    const text = String(value ?? "");

    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export function showToast(
    message,
    type = "success"
) {
    if (!toastElement) {
        return;
    }

    clearTimeout(toastTimer);

    toastElement.textContent = message;
    toastElement.classList.remove(
        "visible",
        "error"
    );

    if (type === "error") {
        toastElement.classList.add("error");
    }

    requestAnimationFrame(() => {
        toastElement.classList.add("visible");
    });

    toastTimer = setTimeout(() => {
        toastElement.classList.remove(
            "visible"
        );
    }, 3500);
}

export function initializeSidebar() {
    const sidebar =
        document.getElementById("sidebar");

    const sidebarOverlay =
        document.getElementById(
            "sidebar-overlay"
        );

    const menuButton =
        document.getElementById("menu-button");

    const closeButton =
        document.getElementById(
            "sidebar-close"
        );

    function openSidebar() {
        sidebar?.classList.add("open");
        sidebarOverlay?.classList.add(
            "visible"
        );
    }

    function closeSidebar() {
        sidebar?.classList.remove("open");
        sidebarOverlay?.classList.remove(
            "visible"
        );
    }

    menuButton?.addEventListener(
        "click",
        openSidebar
    );

    closeButton?.addEventListener(
        "click",
        closeSidebar
    );

    sidebarOverlay?.addEventListener(
        "click",
        closeSidebar
    );

    document
        .querySelectorAll(".nav-link")
        .forEach((link) => {
            link.addEventListener(
                "click",
                () => {
                    document
                        .querySelectorAll(
                            ".nav-link"
                        )
                        .forEach((item) => {
                            item.classList.remove(
                                "active"
                            );
                        });

                    link.classList.add("active");
                    closeSidebar();
                }
            );
        });
}

export function initializeSectionNavigation() {
    const navLinks = document.querySelectorAll(
        ".sidebar-nav .nav-link"
    );

    const sections = [
        document.getElementById("overview"),
        document.getElementById("ai-tutor"),
        document.getElementById("study-plans"),
        document.getElementById("recent-activity")
    ].filter(Boolean);

    function setActiveLink(sectionId) {
        navLinks.forEach((link) => {
            const isActive =
                link.getAttribute("href") ===
                `#${sectionId}`;

            link.classList.toggle(
                "active",
                isActive
            );
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener(
            "click",
            () => {
                const targetId =
                    link
                        .getAttribute("href")
                        ?.replace("#", "");

                if (targetId) {
                    setActiveLink(targetId);
                }
            }
        );
    });

    const observer =
        new IntersectionObserver(
            (entries) => {
                const visibleEntries =
                    entries
                        .filter(
                            (entry) =>
                                entry.isIntersecting
                        )
                        .sort(
                            (a, b) =>
                                b.intersectionRatio -
                                a.intersectionRatio
                        );

                if (
                    visibleEntries.length > 0
                ) {
                    setActiveLink(
                        visibleEntries[0]
                            .target.id
                    );
                }
            },
            {
                root: null,

                rootMargin:
                    "-20% 0px -60% 0px",

                threshold: [
                    0,
                    0.1,
                    0.25,
                    0.5
                ]
            }
        );

    sections.forEach((section) => {
        observer.observe(section);
    });
}