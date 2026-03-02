import {getSessionId, getTeamId, recordServeReceiveRep} from "../../utils/dbUtils.mjs";

const post = async (req, res) => {
    try {
        const { teamName, sessionName, serverPlayerId, passerPlayerId, passRating, missedServe } = req.body;

        if (!teamName || !sessionName || !serverPlayerId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const teamId = await getTeamId(req.user?.userId, teamName);
        if (teamId === -1) {
            return res.status(404).json({ error: "Team not found" });
        }

        const sessionId = await getSessionId(teamId, sessionName);
        if (sessionId === -1) {
            return res.status(404).json({ error: "Session not found" });
        }

        const repId = await recordServeReceiveRep(req.user.userId, teamId, sessionId, {
            serverPlayerId: Number(serverPlayerId),
            passerPlayerId: passerPlayerId ? Number(passerPlayerId) : null,
            passRating,
            missedServe: Boolean(missedServe),
        });

        return res.status(201).json({ message: "Rep recorded", repId });
    } catch (error) {
        console.error("Error processing request:", error.message || error.stack);
        return res.status(error.code || 500).json({ error: error.message || "Internal Server Error" });
    }
};

export default {
    post,
};
