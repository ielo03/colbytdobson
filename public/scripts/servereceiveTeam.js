let teamName = null;
let players = null;

async function fetchPlayers(teamName) {
    try {
        const response = await fetch(
            `/api/servereceive/players?teamName=${teamName}`,{
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
        if (response.ok) {
            players = await response.json();
            console.log(players);
            populateTable(players);
            // displayPlayers(players);
        } else {
            alert("Failed to fetch players. Please check the team name.");
        }
    } catch (err) {
        console.error("Error fetching players:", err);
        alert("An error occurred while fetching the players.");
    }
}

async function createSession() {
    const sessionValue = document.getElementById("session").value;

    if (!sessionValue) {
        alert("Please enter a session name.");
        return;
    }

    try {
        const response = await fetch("/api/create-session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ session: sessionValue }),
        });

        if (response.ok) {
            alert("Session created successfully!");
            document.getElementById("session").value = ""; // Clear input
        } else {
            alert("Failed to create session.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while creating the session.");
    }
}

const populateTable = (data) => {
    if (!data) data = players;
    console.log(`Data: ${JSON.stringify(data)}`);
    const tableBody = document.getElementById("playersTable").querySelector("tbody");

    // Clear existing rows
    tableBody.innerHTML = "";

    // Add rows dynamically
    data.forEach((item) => {
        const row = document.createElement("tr");

        const rowData = [
            item.playerName,
            item.averagePassRating,
            item.totalPasses,
            item.averageServeRating,
            item.totalServes,
        ];

        rowData.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
};

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get("message");
    if (message) {
        alert(message);
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }

    teamName = document.getElementById('manage').innerText.split(' ')[1];
    players = await fetchPlayers(teamName);

    document
        .getElementById("addPlayerForm")
        .addEventListener("submit", async function (event) {
            event.preventDefault();

            const playerName = document.getElementById("player").value;

            if (playerName) {
                try {
                    const response = await fetch(
                        "/api/servereceive/player",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ teamName, playerName }),
                        }
                    );

                    if (response.ok) {
                        document.getElementById("player").value = "";
                        await fetchPlayers(teamName);
                    } else {
                        const error = await response.json();
                        alert(`Failed to add player: ${error.message}`);
                    }
                } catch (err) {
                    console.error("Error adding player:", err);
                    alert("An error occurred while adding the player.");
                }
            } else {
                await fetchPlayers(teamName);
            }
        });
});