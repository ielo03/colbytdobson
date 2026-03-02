let sessionPageState = {
    teamName: null,
    sessionName: null,
    players: [],
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
    const options = sessionPageState.players.map((player) => ({
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
