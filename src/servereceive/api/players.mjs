import {getPlayers, getTeamId} from "../../utils/dbUtils.mjs";

const get = async (req, res) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        return res.status(200).json(await getPlayers(req.user?.userId, await getTeamId(req.user?.userId, req.query.teamName)));
    } catch (error) {
        console.error("Error processing request:", error.message || error.stack);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export default {
    get
};