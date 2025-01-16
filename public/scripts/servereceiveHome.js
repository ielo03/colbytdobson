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
    for (const team of teams) {
        const teamLink = document.createElement('a');     // Create a new <a> element

        teamLink.id = `team${team.id}`;                   // Set the ID as team${id}
        teamLink.href = `/servereceive/${team.teamName}`; // Set the href as required
        teamLink.textContent = team.teamName;            // Set the link text to the team name
        teamLink.className = 'team-link';

        teamsDiv.appendChild(teamLink);
        teamsDiv.appendChild(document.createElement('br'));
    }
};

window.addEventListener("load", async () => {
    window.addEventListener('loggedIn', () => refreshTeams())

    document.getElementById('createTeamForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const createTeam = document.getElementById('createTeam').value.trim();
        const resultDiv = document.getElementById('createResult');

        if (!createTeam) {
            resultDiv.style.display = 'block';
            resultDiv.textContent = 'Please enter a team.';
            resultDiv.className = 'error';
            return;
        }

        try {
            const response = await fetch(`/api/servereceive/team`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${App.accessToken}`
                },
                body: JSON.stringify({
                    teamName: createTeam
                }),
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            refreshTeams();
        } catch (error) {
            console.error('Error creating team:', error);
            resultDiv.style.display = 'block';
            resultDiv.textContent = 'An error occurred while creating the team. Please try again later.';
            resultDiv.className = 'error';
            refreshTeams();
        }
    });
});