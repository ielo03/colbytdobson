import {getTeamId, getTeamStats} from "../../utils/dbUtils.mjs";

const get = async (req, res) => {
    try {
        const { teamName, sessionIds } = req.query;
        const teamId = await getTeamId(req.user?.userId, teamName);

        if (teamId === -1) {
            return res.status(404).json({ error: "Team not found" });
        }

        const parsedSessionIds = typeof sessionIds === "string" && sessionIds.length > 0
            ? sessionIds.split(",")
            : [];

        return res.status(200).json(await getTeamStats(req.user.userId, teamId, parsedSessionIds));
    } catch (error) {
        console.error("Error processing request:", error.message || error.stack);
        return res.status(error.code || 500).json({ error: error.message || "Internal Server Error" });
    }
};

export default {
    get,
};
