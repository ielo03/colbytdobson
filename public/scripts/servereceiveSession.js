let sessionPageState = {
    teamName: null,
    sessionName: null,
    players: [],
    visiblePlayerIds: [],
    selectedServerId: null,
    selectedPasserId: null,
    selectedPassRating: null,
    missedServe: false,
};
let initialized = false;

const passToServeRating = {
    0: 3,
    1: 3,
    2: 2,
    3: 1,
};

const getSessionPage = () => document.getElementById("servereceiveSessionPage");

const authorizedFetch = async (url, options = {}) => {
    const hasToken = await ensureAccessToken();
    if (!hasToken) {
        throw new Error("You must be logged in to use serve receive.");
    }

    return fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${App.accessToken}`,
        },
    });
};

const setRecordMessage = (message, isError = false) => {
    const element = document.getElementById("recordResult");
    element.textContent = message || "";
    element.className = `inline-message${message ? (isError ? " error" : " success") : ""}`;
};

const currentServeRating = () => {
    if (sessionPageState.missedServe) {
        return 0;
    }
    if (sessionPageState.selectedPassRating === null) {
        return null;
    }
    return passToServeRating[sessionPageState.selectedPassRating];
};

const updateRecordButton = () => {
    const button = document.getElementById("recordRepButton");
    const derived = document.getElementById("derivedServeRating");
    const passerStep = document.getElementById("passerStep");
    const ready = sessionPageState.selectedServerId !== null && (
        sessionPageState.missedServe ||
        (sessionPageState.selectedPasserId !== null && sessionPageState.selectedPassRating !== null)
    );

    passerStep.style.display = sessionPageState.missedServe ? "none" : "block";
    const serveRating = currentServeRating();
    derived.textContent = `Serve rating: ${serveRating === null ? "-" : serveRating}`;
    button.disabled = !ready;
};

const renderSelectableButtons = (containerId, items, selectedId, onSelect) => {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    items.forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `chip-button${selectedId === item.id ? " selected" : ""}`;
        button.textContent = item.label;
        button.addEventListener("click", () => onSelect(item.id));
        container.appendChild(button);
    });
};

const visiblePlayers = () => {
    if (!sessionPageState.visiblePlayerIds.length) {
        return [];
    }

    const visibleIds = new Set(sessionPageState.visiblePlayerIds);
    return sessionPageState.players.filter((player) => visibleIds.has(player.playerId));
};

const renderPlayerFilters = () => {
    const container = document.getElementById("playerFilterOptions");
    container.innerHTML = "";

    sessionPageState.players.forEach((player) => {
        const label = document.createElement("label");
        label.className = "checkbox-card";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = sessionPageState.visiblePlayerIds.includes(player.playerId);
        input.addEventListener("change", () => {
            if (input.checked) {
                if (!sessionPageState.visiblePlayerIds.includes(player.playerId)) {
                    sessionPageState.visiblePlayerIds.push(player.playerId);
                }
            } else {
                sessionPageState.visiblePlayerIds = sessionPageState.visiblePlayerIds.filter((id) => id !== player.playerId);
                if (!sessionPageState.visiblePlayerIds.includes(sessionPageState.selectedServerId)) {
                    sessionPageState.selectedServerId = null;
                }
                if (!sessionPageState.visiblePlayerIds.includes(sessionPageState.selectedPasserId)) {
                    sessionPageState.selectedPasserId = null;
                }
            }

            renderPlayerFilters();
            renderPlayerSelectors();
            updateRecordButton();
        });

        const text = document.createElement("span");
        text.textContent = player.playerName;

        label.appendChild(input);
        label.appendChild(text);
        container.appendChild(label);
    });
};

const renderPassButtons = () => {
    const ratings = [0, 1, 2, 3].map((value) => ({ id: value, label: String(value) }));
    renderSelectableButtons(
        "passRatingOptions",
        ratings,
        sessionPageState.selectedPassRating,
        (rating) => {
            sessionPageState.selectedPassRating = rating;
            renderPassButtons();
            updateRecordButton();
        }
    );
};

const renderPlayerSelectors = () => {
    const options = visiblePlayers().map((player) => ({
        id: player.playerId,
        label: player.playerName,
    }));

    renderSelectableButtons("serverOptions", options, sessionPageState.selectedServerId, (playerId) => {
        sessionPageState.selectedServerId = playerId;
        renderPlayerSelectors();
        updateRecordButton();
    });

    renderSelectableButtons("passerOptions", options, sessionPageState.selectedPasserId, (playerId) => {
        sessionPageState.selectedPasserId = playerId;
        renderPlayerSelectors();
        updateRecordButton();
    });
};

const renderRecentReps = (recentReps) => {
    const tbody = document.getElementById("recentRepsTable").querySelector("tbody");
    const recentCount = document.getElementById("recentCount");
    tbody.innerHTML = "";
    recentCount.textContent = `${recentReps.length} shown`;

    recentReps.forEach((rep) => {
        const row = document.createElement("tr");
        const values = [
            new Date(rep.createdAt).toLocaleString(),
            rep.serverName || "-",
            rep.passerName || "-",
            rep.missedServe ? "Yes" : "No",
            rep.passRating ?? "-",
            rep.serveRating,
        ];

        values.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
};

const loadSession = async () => {
    const response = await authorizedFetch(
        `/api/servereceive/session?teamName=${encodeURIComponent(sessionPageState.teamName)}&sessionName=${encodeURIComponent(sessionPageState.sessionName)}`
    );
    const payload = await response.json();

    if (!response.ok) {
        throw new Error(payload.error || "Failed to load session");
    }

    sessionPageState.players = payload.players || [];
    if (sessionPageState.visiblePlayerIds.length === 0) {
        sessionPageState.visiblePlayerIds = sessionPageState.players.map((player) => player.playerId);
    } else {
        const validIds = new Set(sessionPageState.players.map((player) => player.playerId));
        sessionPageState.visiblePlayerIds = sessionPageState.visiblePlayerIds.filter((playerId) => validIds.has(playerId));
    }
    renderPlayerFilters();
    renderPlayerSelectors();
    renderPassButtons();
    renderRecentReps(payload.recentReps || []);
    updateRecordButton();
};

const resetSelection = () => {
    sessionPageState.selectedServerId = null;
    sessionPageState.selectedPasserId = null;
    sessionPageState.selectedPassRating = null;
    sessionPageState.missedServe = false;
    document.getElementById("missedServe").checked = false;
    renderPlayerFilters();
    renderPlayerSelectors();
    renderPassButtons();
    updateRecordButton();
};

const initializeSessionPage = async () => {
    if (initialized) {
        return;
    }

    const page = getSessionPage();
    if (!page) {
        return;
    }

    initialized = true;
    sessionPageState.teamName = page.dataset.teamName;
    sessionPageState.sessionName = page.dataset.sessionName;

    await loadSession();

    document.getElementById("showAllPlayersButton").addEventListener("click", () => {
        sessionPageState.visiblePlayerIds = sessionPageState.players.map((player) => player.playerId);
        renderPlayerFilters();
        renderPlayerSelectors();
        updateRecordButton();
    });

    document.getElementById("hideAllPlayersButton").addEventListener("click", () => {
        sessionPageState.visiblePlayerIds = [];
        sessionPageState.selectedServerId = null;
        sessionPageState.selectedPasserId = null;
        renderPlayerFilters();
        renderPlayerSelectors();
        updateRecordButton();
    });

    document.getElementById("missedServe").addEventListener("change", (event) => {
        sessionPageState.missedServe = event.target.checked;
        if (sessionPageState.missedServe) {
            sessionPageState.selectedPasserId = null;
            sessionPageState.selectedPassRating = null;
            renderPlayerSelectors();
            renderPassButtons();
        }
        updateRecordButton();
    });

    document.getElementById("recordRepButton").addEventListener("click", async () => {
        setRecordMessage("");

        const response = await authorizedFetch("/api/servereceive/rep", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                teamName: sessionPageState.teamName,
                sessionName: sessionPageState.sessionName,
                serverPlayerId: sessionPageState.selectedServerId,
                passerPlayerId: sessionPageState.selectedPasserId,
                passRating: sessionPageState.selectedPassRating,
                missedServe: sessionPageState.missedServe,
            }),
        });

        const payload = await response.json();
        if (!response.ok) {
            setRecordMessage(payload.error || "Failed to record rep.", true);
            return;
        }

        setRecordMessage("Rep recorded.");
        resetSelection();
        await loadSession();
    });
};

const maybeInitializeSessionPage = async () => {
    if (!App.accessToken && !App?.cookies?.refreshTokenExpiry) {
        return;
    }

    try {
        await initializeSessionPage();
    } catch (error) {
        initialized = false;
        console.error(error);
        alert(error.message || "Failed to initialize session page.");
    }
};

document.addEventListener("DOMContentLoaded", maybeInitializeSessionPage);
window.addEventListener("loggedIn", maybeInitializeSessionPage);
