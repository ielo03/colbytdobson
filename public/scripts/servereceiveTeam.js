const initialPlayers = { initialPlayers: 0 };

async function fetchPlayers(teamName) {
    try {
        const response = await fetch(
            `https://colbytdobson.com/api/get-players?team=${encodeURIComponent(
                teamName
            )}`
        );
        if (response.ok) {
            const players = await response.json();
            displayPlayers(players);
        } else {
            alert("Failed to fetch players. Please check the team name.");
        }
    } catch (err) {
        console.error("Error fetching players:", err);
        alert("An error occurred while fetching the players.");
    }
}

function displayPlayers(players) {
    const playersList = document.getElementById("players");
    playersList.innerHTML = "";
    players.forEach((player) => {
        const li = document.createElement("li");

        const span = document.createElement("span");
        span.textContent = player.player;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete");
        deleteButton.addEventListener("click", async () => {
            if (
                confirm(`Are you sure you want to delete ${player.player}?`) &&
                (players.length > 1 ||
                    confirm(
                        `Deleting the last player will also delete the team. Are you sure you want to continue?`
                    ))
            ) {
                try {
                    const response = await fetch(
                        "https://colbytdobson.com/api/delete-player",
                        {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                team: player.team,
                                player: player.player,
                            }),
                        }
                    );

                    if (players.length <= 1) {
                        window.location.href =
                            "https://colbytdobson.com/servereceive";
                    }

                    if (response.ok) {
                        await fetchPlayers(player.team);
                    } else {
                        const error = await response.json();
                        alert(`Failed to delete player: ${error.message}`);
                    }
                } catch (err) {
                    console.error("Error deleting player:", err);
                    alert("An error occurred while deleting the player.");
                }
            }
        });

        li.appendChild(span);
        li.appendChild(deleteButton);
        playersList.appendChild(li);
    });
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

document.addEventListener("DOMContentLoaded", () => {
    const team = document.title//decodeURIComponent(window.location.pathname.split("/")[2]);
    // if (!team) {
    //     window.location.href = "https://colbytdobson.com/servereceive";
    //     return;
    // }
    // document.title = `Manage ${team}`;
    // document.getElementById("manage").innerHTML = `Manage ${team}`;

    displayPlayers(initialPlayers);

    document
        .getElementById("addPlayerForm")
        .addEventListener("submit", async function (event) {
            event.preventDefault();

            const player = document.getElementById("player").value;

            if (player) {
                try {
                    const response = await fetch(
                        "https://colbytdobson.com/api/add-player",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ team, player }),
                        }
                    );

                    if (response.ok) {
                        document.getElementById("player").value = "";
                        await fetchPlayers(team);
                    } else {
                        const error = await response.json();
                        alert(`Failed to add player: ${error.message}`);
                    }
                } catch (err) {
                    console.error("Error adding player:", err);
                    alert("An error occurred while adding the player.");
                }
            } else {
                await fetchPlayers(team);
            }
        });
});