import {getTeams} from "../../utils/dbUtils.mjs";

const get = async (req, res) => {
    try {
        return res.status(200).json(await getTeams(req.user?.userId));
    } catch (error) {
        console.error("Error processing request:", error.message || error.stack);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export default {
    get
};