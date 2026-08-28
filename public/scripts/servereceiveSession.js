let sessionPageState = {
    teamName: null,
    sessionName: null,
    players: [],
    visibleServerIds: [],
    visiblePasserIds: [],
    absentPlayerIds: [],
    playerFiltersInitialized: false,
    activeFilterMode: null,
    selectedServerId: null,
    selectedPasserId: null,
    selectedPassRating: null,
    missedServe: false,
    editingRepId: null,
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
    const cancelButton = document.getElementById("cancelEditRepButton");
    const derived = document.getElementById("derivedServeRating");
    const passerStep = document.getElementById("passerStep");
    const ready = sessionPageState.selectedServerId !== null && (
        sessionPageState.missedServe ||
        (sessionPageState.selectedPasserId !== null && sessionPageState.selectedPassRating !== null)
    );

    passerStep.style.display = sessionPageState.missedServe ? "none" : "block";
    const serveRating = currentServeRating();
    derived.textContent = `Serve rating: ${serveRating === null ? "-" : serveRating}`;
    button.textContent = sessionPageState.editingRepId === null ? "Record Rep" : "Save Changes";
    cancelButton.hidden = sessionPageState.editingRepId === null;
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
    const absentIds = new Set(sessionPageState.absentPlayerIds);
    const selectedId = mode === "server"
        ? sessionPageState.selectedServerId
        : sessionPageState.selectedPasserId;
    return sessionPageState.players.filter((player) => (
        visibleIds.has(player.playerId) && (!absentIds.has(player.playerId) || player.playerId === selectedId)
    ));
};

const presentPlayers = () => {
    const absentIds = new Set(sessionPageState.absentPlayerIds);
    return sessionPageState.players.filter((player) => !absentIds.has(player.playerId));
};

const summarizeFilter = (ids) => {
    const presentIds = new Set(presentPlayers().map((player) => player.playerId));
    const visibleCount = ids.filter((id) => presentIds.has(id)).length;

    if (visibleCount === 0) {
        return "none";
    }

    if (visibleCount === presentIds.size) {
        return "all";
    }

    return `${visibleCount}`;
};

const renderFilterSummaries = () => {
    document.getElementById("absentFilterSummary").textContent = `Not here: ${sessionPageState.absentPlayerIds.length}`;
    document.getElementById("serverFilterSummary").textContent = `Servers shown: ${summarizeFilter(sessionPageState.visibleServerIds)}`;
    document.getElementById("passerFilterSummary").textContent = `Receivers shown: ${summarizeFilter(sessionPageState.visiblePasserIds)}`;
};

const getFilterIds = (mode) => mode === "server"
    ? sessionPageState.visibleServerIds
    : mode === "passer"
        ? sessionPageState.visiblePasserIds
        : sessionPageState.absentPlayerIds;

const setFilterIds = (mode, ids) => {
    if (mode === "server") {
        sessionPageState.visibleServerIds = ids;
        if (!ids.includes(sessionPageState.selectedServerId)) {
            sessionPageState.selectedServerId = null;
        }
    } else if (mode === "passer") {
        sessionPageState.visiblePasserIds = ids;
        if (!ids.includes(sessionPageState.selectedPasserId)) {
            sessionPageState.selectedPasserId = null;
        }
    } else {
        sessionPageState.absentPlayerIds = ids;
        if (ids.includes(sessionPageState.selectedServerId)) {
            sessionPageState.selectedServerId = null;
        }
        if (ids.includes(sessionPageState.selectedPasserId)) {
            sessionPageState.selectedPasserId = null;
        }
    }
};

const complementFilterIds = (mode) => {
    const oppositeIds = new Set(mode === "server"
        ? sessionPageState.visiblePasserIds
        : sessionPageState.visibleServerIds);
    return presentPlayers()
        .map((player) => player.playerId)
        .filter((playerId) => !oppositeIds.has(playerId));
};

const renderPlayerFilterOverlay = () => {
    const overlay = document.getElementById("playerFilterOverlay");
    const container = document.getElementById("playerFilterOverlayOptions");
    const title = document.getElementById("playerFilterOverlayTitle");
    const showAllButton = document.getElementById("overlayShowAllPlayersButton");
    const hideAllButton = document.getElementById("overlayHideAllPlayersButton");
    const complementButton = document.getElementById("overlaySelectComplementButton");
    const mode = sessionPageState.activeFilterMode;

    if (!mode) {
        overlay.hidden = true;
        return;
    }

    overlay.hidden = false;
    title.textContent = mode === "server"
        ? "Edit Servers"
        : mode === "passer"
            ? "Edit Receivers"
            : "Players Not Here";
    showAllButton.textContent = mode === "absent" ? "Mark All Not Here" : "Show All";
    hideAllButton.textContent = mode === "absent" ? "Mark Everyone Here" : "Hide All";
    complementButton.hidden = mode === "absent";
    complementButton.textContent = mode === "server" ? "Select Non-Receivers" : "Select Non-Servers";
    container.innerHTML = "";
    const currentIds = getFilterIds(mode);
    const availablePlayers = mode === "absent" ? sessionPageState.players : presentPlayers();

    availablePlayers.forEach((player) => {
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

        const actionsCell = document.createElement("td");
        const actions = document.createElement("div");
        actions.className = "rep-row-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "secondary-button compact-button";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => beginEditingRep(rep));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "danger-button compact-button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteRep(rep));

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);
        actionsCell.appendChild(actions);
        row.appendChild(actionsCell);

        tbody.appendChild(row);
    });
};

const beginEditingRep = (rep) => {
    sessionPageState.editingRepId = rep.repId;
    sessionPageState.selectedServerId = rep.serverPlayerId;
    sessionPageState.selectedPasserId = rep.missedServe ? null : rep.passerPlayerId;
    sessionPageState.selectedPassRating = rep.missedServe ? null : Number(rep.passRating);
    sessionPageState.missedServe = Boolean(rep.missedServe);

    if (!sessionPageState.visibleServerIds.includes(rep.serverPlayerId)) {
        sessionPageState.visibleServerIds.push(rep.serverPlayerId);
    }
    if (rep.passerPlayerId && !sessionPageState.visiblePasserIds.includes(rep.passerPlayerId)) {
        sessionPageState.visiblePasserIds.push(rep.passerPlayerId);
    }

    document.getElementById("missedServe").checked = sessionPageState.missedServe;
    setRecordMessage("Editing selected rep.");
    renderFilterSummaries();
    renderPlayerSelectors();
    renderPassButtons();
    updateRecordButton();
    document.querySelector(".record-flow").scrollIntoView({behavior: "smooth", block: "start"});
};

const deleteRep = async (rep) => {
    const label = `${rep.serverName || "Unknown server"} at ${new Date(rep.createdAt).toLocaleString()}`;
    if (!window.confirm(`Delete the rep by ${label}? This cannot be undone.`)) {
        return;
    }

    try {
        const response = await authorizedFetch("/api/servereceive/rep", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                teamName: sessionPageState.teamName,
                sessionName: sessionPageState.sessionName,
                repId: rep.repId,
            }),
        });

        const payload = await response.json();
        if (!response.ok) {
            throw new Error(payload.error || "Failed to delete rep.");
        }

        if (sessionPageState.editingRepId === rep.repId) {
            resetSelection();
        }
        setRecordMessage("Rep deleted.");
        await loadSession();
    } catch (error) {
        setRecordMessage(error.message || "Failed to delete rep.", true);
    }
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
    const validIds = new Set(sessionPageState.players.map((player) => player.playerId));
    sessionPageState.absentPlayerIds = sessionPageState.absentPlayerIds.filter((playerId) => validIds.has(playerId));
    if (!sessionPageState.playerFiltersInitialized) {
        sessionPageState.visibleServerIds = sessionPageState.players.map((player) => player.playerId);
        sessionPageState.visiblePasserIds = sessionPageState.players.map((player) => player.playerId);
        sessionPageState.playerFiltersInitialized = true;
    } else {
        sessionPageState.visibleServerIds = sessionPageState.visibleServerIds.filter((playerId) => validIds.has(playerId));
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
    sessionPageState.editingRepId = null;
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

    document.getElementById("editAbsentPlayersButton").addEventListener("click", () => {
        sessionPageState.activeFilterMode = "absent";
        renderPlayerFilterOverlay();
    });

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
        const players = sessionPageState.activeFilterMode === "absent"
            ? sessionPageState.players
            : presentPlayers();
        const ids = players.map((player) => player.playerId);
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

    document.getElementById("overlaySelectComplementButton").addEventListener("click", () => {
        const mode = sessionPageState.activeFilterMode;
        if (mode !== "server" && mode !== "passer") {
            return;
        }

        setFilterIds(mode, complementFilterIds(mode));
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

        const editingRepId = sessionPageState.editingRepId;

        const response = await authorizedFetch("/api/servereceive/rep", {
            method: editingRepId === null ? "POST" : "PUT",
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
                repId: editingRepId,
            }),
        });

        const payload = await response.json();
        if (!response.ok) {
            setRecordMessage(payload.error || "Failed to record rep.", true);
            return;
        }

        setRecordMessage(editingRepId === null ? "Rep recorded." : "Rep updated.");
        resetSelection();
        await loadSession();
    });

    document.getElementById("cancelEditRepButton").addEventListener("click", () => {
        resetSelection();
        setRecordMessage("Edit cancelled.");
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
