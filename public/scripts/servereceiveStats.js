let statsPageState = {
    teamName: null,
};
let initialized = false;

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

const selectedSessionIds = () => {
    return Array.from(document.querySelectorAll("#statsSessions input[type='checkbox']:checked"))
        .map((input) => input.value);
};

const renderSummaryCards = (overall) => {
    const overallStats = document.getElementById("overallStats");
    const cards = [
        ["Total Reps", overall.totalReps || 0],
        ["Average Pass Rating", Number(overall.averagePassRating || 0).toFixed(2)],
        ["Total Passes", overall.totalPasses || 0],
        ["Average Serve Rating", Number(overall.averageServeRating || 0).toFixed(2)],
        ["Total Serves", overall.totalServes || 0],
        ["Missed Serves", overall.missedServes || 0],
    ];

    overallStats.innerHTML = "";
    cards.forEach(([label, value]) => {
        const card = document.createElement("div");
        card.className = "stat-card";
        card.innerHTML = `<span class="stat-label">${label}</span><strong class="stat-value">${value}</strong>`;
        overallStats.appendChild(card);
    });
};

const renderStatsSessions = (sessions, selectedIds) => {
    const container = document.getElementById("statsSessions");
    const count = document.getElementById("statsSessionCount");
    count.textContent = `${sessions.length} sessions`;
    container.innerHTML = "";

    sessions.forEach((session) => {
        const label = document.createElement("label");
        label.className = "checkbox-card";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.value = String(session.sessionId);
        input.checked = selectedIds.length === 0 || selectedIds.includes(session.sessionId);
        label.appendChild(input);

        const text = document.createElement("span");
        text.textContent = session.sessionName;
        label.appendChild(text);
        container.appendChild(label);
    });
};

const renderPlayerStats = (players) => {
    const tbody = document.getElementById("statsPlayersTable").querySelector("tbody");
    const count = document.getElementById("statsPlayerCount");
    count.textContent = `${players.length} players`;
    tbody.innerHTML = "";

    players.forEach((player) => {
        const row = document.createElement("tr");
        [
            player.playerName,
            Number(player.averagePassRating || 0).toFixed(2),
            player.totalPasses || 0,
            Number(player.averageServeRating || 0).toFixed(2),
            player.totalServes || 0,
            player.missedServes || 0,
        ].forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });
};

const renderSessionBreakdown = (sessions) => {
    const tbody = document.getElementById("statsSessionsTable").querySelector("tbody");
    tbody.innerHTML = "";

    sessions.forEach((session) => {
        const row = document.createElement("tr");
        [
            session.sessionName,
            session.totalReps || 0,
            Number(session.averagePassRating || 0).toFixed(2),
            Number(session.averageServeRating || 0).toFixed(2),
            session.missedServes || 0,
        ].forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });
};

const loadStats = async (preferredSelection = null) => {
    const sessionIds = preferredSelection || selectedSessionIds();
    const query = new URLSearchParams({
        teamName: statsPageState.teamName,
    });

    if (sessionIds.length > 0) {
        query.set("sessionIds", sessionIds.join(","));
    }

    const response = await authorizedFetch(`/api/servereceive/stats?${query.toString()}`);
    const payload = await response.json();

    if (!response.ok) {
        throw new Error(payload.error || "Failed to load stats");
    }

    renderStatsSessions(payload.sessions || [], payload.selectedSessionIds || []);
    renderSummaryCards(payload.overall || {});
    renderPlayerStats(payload.players || []);

    const selectedIds = payload.selectedSessionIds || [];
    const filteredSessions = selectedIds.length === 0
        ? payload.sessions || []
        : (payload.sessions || []).filter((session) => selectedIds.includes(session.sessionId));
    renderSessionBreakdown(filteredSessions);
};

const initializeStatsPage = async () => {
    if (initialized) {
        return;
    }

    const page = document.getElementById("servereceiveStatsPage");
    if (!page) {
        return;
    }

    initialized = true;
    statsPageState.teamName = page.dataset.teamName;
    await loadStats([]);

    document.getElementById("refreshStatsButton").addEventListener("click", async () => {
        await loadStats();
    });
};

const maybeInitializeStatsPage = async () => {
    if (!App.accessToken && !App?.cookies?.refreshTokenExpiry) {
        return;
    }

    try {
        await initializeStatsPage();
    } catch (error) {
        initialized = false;
        console.error(error);
        alert(error.message || "Failed to initialize stats page.");
    }
};

document.addEventListener("DOMContentLoaded", maybeInitializeStatsPage);
window.addEventListener("loggedIn", maybeInitializeStatsPage);
