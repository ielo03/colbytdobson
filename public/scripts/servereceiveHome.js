document.getElementById('teamForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const team = document.getElementById('team').value.trim();
    const resultDiv = document.getElementById('result');

    if (!team) {
        resultDiv.style.display = 'block';
        resultDiv.textContent = 'Please enter a team.';
        resultDiv.className = 'error';
        return;
    }

    try {
        const response = await fetch(`https://colbytdobson.com/api/team-exists?team=${encodeURIComponent(team)}`);

        if (response.status !== 404) {
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();

            if (data.exists) {
                window.location.href = `https://colbytdobson.com/servereceive/${encodeURIComponent(team)}`;
                return;
            }
        }

        resultDiv.style.display = 'block';
        resultDiv.textContent = `The team "${team}" does not exist.`;
        resultDiv.className = 'error';
    } catch (error) {
        console.error('Error checking team:', error);
        resultDiv.style.display = 'block';
        resultDiv.textContent = 'An error occurred while checking the team. Please try again later.';
        resultDiv.className = 'error';
    }
});

document.getElementById('createTeamForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const createTeam = document.getElementById('createTeam').value.trim();
    const createPlayer = document.getElementById('createPlayer').value.trim();
    const resultDiv = document.getElementById('createResult');

    if (!createTeam) {
        resultDiv.style.display = 'block';
        resultDiv.textContent = 'Please enter a team.';
        resultDiv.className = 'error';
        return;
    }

    if (!createPlayer) {
        resultDiv.style.display = 'block';
        resultDiv.textContent = 'Please enter a player.';
        resultDiv.className = 'error';
        return;
    }

    try {
        const response = await fetch(`https://colbytdobson.com/api/create-team`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                team: createTeam,
                player: createPlayer,
            }),
        });

        if (response.status !== 409) {
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();

            if (data.item !== {}) {
                window.location.href = `https://colbytdobson.com/servereceive/${encodeURIComponent(createTeam)}`;
                return;
            } else {
                resultDiv.style.display = 'block';
                resultDiv.textContent = `Server returned no confirmation. Use go to existing team to check if it exists.`;
                resultDiv.className = 'success';
            }
        } else {
            resultDiv.style.display = 'block';
            resultDiv.textContent = `The team "${createTeam}" already exists.`;
            resultDiv.className = 'error';
        }
    } catch (error) {
        console.error('Error creating team:', error);
        resultDiv.style.display = 'block';
        resultDiv.textContent = 'An error occurred while creating the team. Please try again later.';
        resultDiv.className = 'error';
    }
});