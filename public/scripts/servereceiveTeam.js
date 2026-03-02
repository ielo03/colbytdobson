let teamName = null;
let initialized = false;

const getPage = () => document.getElementById("servereceiveTeamPage");

const authorizedFetch = async (url, options = {}) => {
    const hasToken = await ensureAccessToken();
    if (!hasToken) {
        throw new Error("You must be logged in to use serve receive.");
    }

    const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${App.accessToken}`,
    };

    return fetch(url, {
        ...options,
        headers,
    });
};

const setMessage = (id, message, isError = false) => {
    const element = document.getElementById(id);
    element.textContent = message || "";
    element.className = `inline-message${message ? (isError ? " error" : " success") : ""}`;
};

const createOverflowMenu = (actions) => {
    const details = document.createElement("details");
    details.className = "overflow-menu";

    const summary = document.createElement("summary");
    summary.className = "overflow-menu-trigger";
    summary.setAttribute("aria-label", "Open actions menu");
    summary.textContent = "\u2630";
    details.appendChild(summary);

    const menu = document.createElement("div");
    menu.className = "overflow-menu-content";

    actions.forEach((action) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = action.className || "danger-button";
        button.textContent = action.label;
        button.addEventListener("click", async () => {
            details.removeAttribute("open");
            await action.onClick();
        });
        menu.appendChild(button);
    });

    details.appendChild(menu);
    return details;
};

const validateSessionName = (sessionName) => {
    if (!sessionName) {
        return "Enter a session name.";
    }

    if (sessionName.includes("/")) {
        return "Session names cannot contain slashes.";
    }

    if (sessionName.toLowerCase() === "stats") {
        return "Session name cannot be stats.";
    }

    return null;
};

const refreshPlayers = async () => {
    const response = await authorizedFetch(
        `/api/servereceive/players?teamName=${encodeURIComponent(teamName)}`
    );
    const players = await response.json();
    const tableBody = document.getElementById("playersTable").querySelector("tbody");
    const playersCount = document.getElementById("playersCount");

    playersCount.textContent = `${players.length} players`;
    tableBody.innerHTML = "";

    players.forEach((player) => {
        const row = document.createElement("tr");
        const values = [
            player.playerName,
            Number(player.averagePassRating || 0).toFixed(2),
            player.totalPasses || 0,
            Number(player.averageServeRating || 0).toFixed(2),
            player.totalServes || 0,
        ];

        values.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        actionCell.appendChild(createOverflowMenu([
            {
                label: "Remove Player",
                className: "danger-button",
                onClick: async () => {
                    if (!window.confirm(`Remove ${player.playerName}?`)) {
                        return;
                    }

                    const response = await authorizedFetch(
                        `/api/servereceive/player?teamName=${encodeURIComponent(teamName)}&playerId=${player.playerId}`,
                        { method: "DELETE" }
                    );

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || "Failed to remove player");
                    }

                    await refreshPlayers();
                },
            },
        ]));
        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
};

const refreshSessions = async () => {
    const response = await authorizedFetch(
        `/api/servereceive/sessions?teamName=${encodeURIComponent(teamName)}`
    );
    const sessions = await response.json();
    const sessionsList = document.getElementById("sessionsList");
    const sessionsCount = document.getElementById("sessionsCount");

    sessionsCount.textContent = `${sessions.length} sessions`;
    sessionsList.innerHTML = "";

    if (sessions.length === 0) {
        const empty = document.createElement("p");
        empty.className = "muted-text";
        empty.textContent = "No sessions yet.";
        sessionsList.appendChild(empty);
        return;
    }

    sessions.forEach((session) => {
        const row = document.createElement("div");
        row.className = "action-row";

        const meta = document.createElement("div");
        meta.className = "action-row-main";

        const link = document.createElement("a");
        link.className = "text-link";
        link.href = `/servereceive/${encodeURIComponent(teamName)}/${encodeURIComponent(session.sessionName)}`;
        link.textContent = session.sessionName;
        meta.appendChild(link);

        const detail = document.createElement("span");
        detail.className = "muted-text";
        detail.textContent = `${session.totalReps || 0} reps`;
        meta.appendChild(detail);

        const actions = document.createElement("div");
        actions.className = "action-row-buttons";

        const openButton = document.createElement("a");
        openButton.className = "secondary-button";
        openButton.href = link.href;
        openButton.textContent = "Open";
        actions.appendChild(openButton);
        actions.appendChild(createOverflowMenu([
            {
                label: "Delete Session",
                className: "danger-button",
                onClick: async () => {
                    if (!window.confirm(`Delete session ${session.sessionName}?`)) {
                        return;
                    }

                    const response = await authorizedFetch(
                        `/api/servereceive/session?teamName=${encodeURIComponent(teamName)}&sessionId=${session.sessionId}`,
                        { method: "DELETE" }
                    );

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || "Failed to delete session");
                    }

                    await refreshSessions();
                },
            },
        ]));

        row.appendChild(meta);
        row.appendChild(actions);
        sessionsList.appendChild(row);
    });
};

const initializePage = async () => {
    if (initialized) {
        return;
    }

    const page = getPage();
    if (!page) {
        return;
    }

    initialized = true;
    teamName = page.dataset.teamName;

    try {
        await Promise.all([refreshPlayers(), refreshSessions()]);
    } catch (error) {
        console.error(error);
        alert(error.message || "Failed to load team data.");
    }

    document.getElementById("addPlayerForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        setMessage("playerResult", "");

        const playerName = document.getElementById("player").value.trim();
        if (!playerName) {
            setMessage("playerResult", "Enter a player name.", true);
            return;
        }

        const response = await authorizedFetch("/api/servereceive/player", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ teamName, playerName }),
        });

        const payload = await response.json();
        if (!response.ok) {
            setMessage("playerResult", payload.error || "Failed to add player.", true);
            return;
        }

        document.getElementById("player").value = "";
        setMessage("playerResult", "Player added.");
        await refreshPlayers();
    });

    document.getElementById("sessionForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        setMessage("sessionResult", "");

        const sessionName = document.getElementById("session").value.trim();
        const validationError = validateSessionName(sessionName);
        if (validationError) {
            setMessage("sessionResult", validationError, true);
            return;
        }

        const response = await authorizedFetch("/api/servereceive/session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ teamName, sessionName }),
        });

        const payload = await response.json();
        if (!response.ok) {
            setMessage("sessionResult", payload.error || "Failed to create session.", true);
            return;
        }

        document.getElementById("session").value = "";
        setMessage("sessionResult", "Session created.");
        await refreshSessions();
    });
};

const maybeInitializePage = async () => {
    if (!App.accessToken && !App?.cookies?.refreshTokenExpiry) {
        return;
    }

    try {
        await initializePage();
    } catch (error) {
        initialized = false;
        console.error(error);
        alert(error.message || "Failed to initialize team page.");
    }
};

document.addEventListener("DOMContentLoaded", maybeInitializePage);
window.addEventListener("loggedIn", maybeInitializePage);
