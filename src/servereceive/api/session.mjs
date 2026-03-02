import {getSessionData, getSessionId, getTeamId} from "../../utils/dbUtils.mjs";

const get = async (req, res) => {
    try {
        const { teamName, sessionName } = req.query;
        const teamId = await getTeamId(req.user?.userId, teamName);

        if (teamId === -1) {
            return res.status(404).json({ error: "Team not found" });
        }

        const sessionId = await getSessionId(teamId, sessionName);
        if (sessionId === -1) {
            return res.status(404).json({ error: "Session not found" });
        }

        return res.status(200).json(await getSessionData(req.user.userId, teamId, sessionId));
    } catch (error) {
        console.error("Error processing request:", error.message || error.stack);
        return res.status(error.code || 500).json({ error: error.message || "Internal Server Error" });
    }
};

export default {
    get,
};
