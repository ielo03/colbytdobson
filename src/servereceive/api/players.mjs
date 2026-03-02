import {getPlayers, getTeamId} from "../../utils/dbUtils.mjs";

const get = async (req, res) => {
    try {
        const teamId = await getTeamId(req.user?.userId, req.query.teamName);
        if (teamId === -1) {
            return res.status(404).json({ error: "Team not found" });
        }

        return res.status(200).json(await getPlayers(req.user?.userId, teamId));
    } catch (error) {
        console.error("Error processing request:", error.message || error.stack);
        return res.status(error.code || 500).json({ error: error.message || "Internal Server Error" });
    }
};

export default {
    get
};
