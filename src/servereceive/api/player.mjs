import {createPlayer, getTeamId, removePlayer} from "../../utils/dbUtils.mjs";

const post = async (req, res) => {
    try {
        const { teamName, playerName } = req.body;

        if (
            !teamName ||
            typeof teamName !== "string" ||
            teamName.length > 20 ||
            teamName.includes("/") ||
            !/^[a-z0-9_\-'.]+$/.test(teamName) ||
            !playerName ||
            typeof playerName !== "string"
        ) {
            console.error("Team or player name invalid");
            return res.status(400).json({ error: "Team or player name invalid" });
        }

        const teamId = await getTeamId(req.user?.userId, teamName);
        if (teamId === -1) {
            return res.status(404).json({ error: "Team not found" });
        }

        try {
            await createPlayer(req.user.userId, teamId, playerName.trim());
            return res.status(201).json({ message: "Player created"});
        } catch (err) {
            return res.status(err.code || 500).json({ error: err.message || "Internal database error" });
        }
    } catch (error) {
        console.error("Error processing request:", error.message || error.stack);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const del = async (req, res) => {
    try {
        const { teamName, playerId } = req.query;

        if (!teamName || !playerId) {
            return res.status(400).json({ error: "Missing team name or player id" });
        }

        const teamId = await getTeamId(req.user?.userId, teamName);
        if (teamId === -1) {
            return res.status(404).json({ error: "Team not found" });
        }

        await removePlayer(req.user.userId, teamId, Number(playerId));
        return res.status(200).json({ message: "Player removed" });
    } catch (error) {
        console.error("Error processing request:", error.message || error.stack);
        return res.status(error.code || 500).json({ error: error.message || "Internal Server Error" });
    }
};

export default {
    post,
    del
};
