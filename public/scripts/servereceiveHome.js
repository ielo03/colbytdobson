let teams = null;

const refreshTeams = async () => {
    const response = await fetch("/api/servereceive/teams", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${App.accessToken}`
        }
    });

    teams = await response.json();
    console.log(JSON.stringify(teams));


    const teamsDiv = document.getElementById('teams');
    teamsDiv.innerHTML = '';
    if (teams && teams.length > 0) {
        for (const team of teams) {
            const teamLink = document.createElement('a');     // Create a new <a> element

            teamLink.id = `team${team.id}`;                   // Set the ID as team${id}
            teamLink.href = `/servereceive/${team.teamName}`; // Set the href as required
            teamLink.textContent = team.teamName;            // Set the link text to the team name
            teamLink.className = 'purple-button';

            teamsDiv.appendChild(teamLink);
            teamsDiv.appendChild(document.createElement('br'));
        }
    }
};

const validateTeamName = () => {
    const createTeam = document.getElementById('createTeam').value.trim();
    const resultDiv = document.getElementById('createResult');

    if (!createTeam) {
        resultDiv.style.display = "block";
        resultDiv.textContent = "Team name cannot be empty";
        resultDiv.className = "error";
        return;
    }

    if (typeof createTeam !== "string") {
        resultDiv.style.display = "block";
        resultDiv.textContent = "Team name must be a string";
        resultDiv.className = "error";
        return;
    }

    if (createTeam.length > 20) {
        resultDiv.style.display = "block";
        resultDiv.textContent = "Team name must not exceed 20 characters";
        resultDiv.className = "error";
        return;
    }

    if (/[A-Z]/.test(createTeam)) {
        resultDiv.style.display = "block";
        resultDiv.textContent = "Team name must only contain lowercase letters";
        resultDiv.className = "error";
        return;
    }

    if (!/^[a-z0-9_\-'.]+$/.test(createTeam)) {
        resultDiv.style.display = "block";
        resultDiv.textContent = "Team name contains invalid characters. Only lowercase letters, numbers, underscores, hyphens, apostrophes, and periods are allowed";
        resultDiv.className = "error";
        return;
    } else {
        resultDiv.style.display = "none";
        resultDiv.textContent = "";
        resultDiv.className = "";
    }

    return createTeam;
};

window.addEventListener("load", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get("message");
    if (message) {
        alert(message);
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }

    window.addEventListener('loggedIn', () => refreshTeams())

    document.getElementById('createTeamForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const resultDiv = document.getElementById('createResult');

        const teamName = validateTeamName();

        if (!teamName) {
            return;
        }

        try {
            const response = await fetch(`/api/servereceive/team`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${App.accessToken}`
                },
                body: JSON.stringify({
                    teamName: teamName
                }),
            });

            if (response.status === 409) {
                resultDiv.style.display = "block";
                resultDiv.textContent = "Team name already exists";
                resultDiv.className = "error";
                return;
            }

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            } else {
                document.getElementById('createTeam').value = '';
            }

            await refreshTeams();
        } catch (error) {
            console.error('Error creating team:', error);
            resultDiv.style.display = 'block';
            resultDiv.textContent = 'An error occurred while creating the team. Please try again later.';
            resultDiv.className = 'error';
            await refreshTeams();
        }
    });
});