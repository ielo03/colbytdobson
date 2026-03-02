let sessionPageState = {
    teamName: null,
    sessionName: null,
    players: [],
    visibleServerIds: [],
    visiblePasserIds: [],
    activeFilterMode: null,
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

const visiblePlayers = (mode) => {
    const ids = mode === "server"
        ? sessionPageState.visibleServerIds
        : sessionPageState.visiblePasserIds;
    if (!ids.length) {
        return [];
    }

    const visibleIds = new Set(ids);
    return sessionPageState.players.filter((player) => visibleIds.has(player.playerId));
};

const summarizeFilter = (ids) => {
    if (ids.length === 0) {
        return "none";
    }

    if (ids.length === sessionPageState.players.length) {
        return "all";
    }

    return `${ids.length}`;
};

const renderFilterSummaries = () => {
    document.getElementById("serverFilterSummary").textContent = `Servers shown: ${summarizeFilter(sessionPageState.visibleServerIds)}`;
    document.getElementById("passerFilterSummary").textContent = `Receivers shown: ${summarizeFilter(sessionPageState.visiblePasserIds)}`;
};

const getFilterIds = (mode) => mode === "server"
    ? sessionPageState.visibleServerIds
    : sessionPageState.visiblePasserIds;

const setFilterIds = (mode, ids) => {
    if (mode === "server") {
        sessionPageState.visibleServerIds = ids;
        if (!ids.includes(sessionPageState.selectedServerId)) {
            sessionPageState.selectedServerId = null;
        }
    } else {
        sessionPageState.visiblePasserIds = ids;
        if (!ids.includes(sessionPageState.selectedPasserId)) {
            sessionPageState.selectedPasserId = null;
        }
    }
};

const renderPlayerFilterOverlay = () => {
    const overlay = document.getElementById("playerFilterOverlay");
    const container = document.getElementById("playerFilterOverlayOptions");
    const title = document.getElementById("playerFilterOverlayTitle");
    const mode = sessionPageState.activeFilterMode;

    if (!mode) {
        overlay.hidden = true;
        return;
    }

    overlay.hidden = false;
    title.textContent = mode === "server" ? "Edit Servers" : "Edit Receivers";
    container.innerHTML = "";
    const currentIds = getFilterIds(mode);

    sessionPageState.players.forEach((player) => {
        const label = document.createElement("label");
        label.className = "checkbox-card";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = currentIds.includes(player.playerId);
        input.addEventListener("change", () => {
            const nextIds = [...getFilterIds(mode)];
            if (input.checked) {
                if (!nextIds.includes(player.playerId)) {
                    nextIds.push(player.playerId);
                }
            } else {
                const filtered = nextIds.filter((id) => id !== player.playerId);
                setFilterIds(mode, filtered);
                renderPlayerFilterOverlay();
                renderFilterSummaries();
                renderPlayerSelectors();
                updateRecordButton();
                return;
            }

            setFilterIds(mode, nextIds);
            renderPlayerFilterOverlay();
            renderFilterSummaries();
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
    const serverOptions = visiblePlayers("server").map((player) => ({
        id: player.playerId,
        label: player.playerName,
    }));
    const passerOptions = visiblePlayers("passer").map((player) => ({
        id: player.playerId,
        label: player.playerName,
    }));

    renderSelectableButtons("serverOptions", serverOptions, sessionPageState.selectedServerId, (playerId) => {
        sessionPageState.selectedServerId = playerId;
        renderPlayerSelectors();
        updateRecordButton();
    });

    renderSelectableButtons("passerOptions", passerOptions, sessionPageState.selectedPasserId, (playerId) => {
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
    if (sessionPageState.visibleServerIds.length === 0) {
        sessionPageState.visibleServerIds = sessionPageState.players.map((player) => player.playerId);
    } else {
        const validIds = new Set(sessionPageState.players.map((player) => player.playerId));
        sessionPageState.visibleServerIds = sessionPageState.visibleServerIds.filter((playerId) => validIds.has(playerId));
    }

    if (sessionPageState.visiblePasserIds.length === 0) {
        sessionPageState.visiblePasserIds = sessionPageState.players.map((player) => player.playerId);
    } else {
        const validIds = new Set(sessionPageState.players.map((player) => player.playerId));
        sessionPageState.visiblePasserIds = sessionPageState.visiblePasserIds.filter((playerId) => validIds.has(playerId));
    }

    renderFilterSummaries();
    renderPlayerFilterOverlay();
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
    renderFilterSummaries();
    renderPlayerFilterOverlay();
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

    document.getElementById("editServerFilterButton").addEventListener("click", () => {
        sessionPageState.activeFilterMode = "server";
        renderPlayerFilterOverlay();
    });

    document.getElementById("editPasserFilterButton").addEventListener("click", () => {
        sessionPageState.activeFilterMode = "passer";
        renderPlayerFilterOverlay();
    });

    document.getElementById("closePlayerFilterOverlay").addEventListener("click", () => {
        sessionPageState.activeFilterMode = null;
        renderPlayerFilterOverlay();
    });

    document.getElementById("playerFilterOverlay").addEventListener("click", (event) => {
        if (event.target.id === "playerFilterOverlay") {
            sessionPageState.activeFilterMode = null;
            renderPlayerFilterOverlay();
        }
    });

    document.getElementById("overlayShowAllPlayersButton").addEventListener("click", () => {
        const ids = sessionPageState.players.map((player) => player.playerId);
        setFilterIds(sessionPageState.activeFilterMode, ids);
        renderPlayerFilterOverlay();
        renderFilterSummaries();
        renderPlayerSelectors();
        updateRecordButton();
    });

    document.getElementById("overlayHideAllPlayersButton").addEventListener("click", () => {
        setFilterIds(sessionPageState.activeFilterMode, []);
        renderPlayerFilterOverlay();
        renderFilterSummaries();
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
