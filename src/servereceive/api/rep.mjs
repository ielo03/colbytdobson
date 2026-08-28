import {
    getSessionId,
    getTeamId,
    recordServeReceiveRep,
    removeServeReceiveRep,
    updateServeReceiveRep,
} from "../../utils/dbUtils.mjs";

const getRepContext = async (req) => {
    const {teamName, sessionName} = req.body;

    if (!teamName || !sessionName) {
        throw Object.assign(new Error("Missing required fields"), {code: 400});
    }

    const teamId = await getTeamId(req.user?.userId, teamName);
    if (teamId === -1) {
        throw Object.assign(new Error("Team not found"), {code: 404});
    }

    const sessionId = await getSessionId(teamId, sessionName);
    if (sessionId === -1) {
        throw Object.assign(new Error("Session not found"), {code: 404});
    }

    return {teamId, sessionId};
};

const getRepId = (value) => {
    const repId = Number(value);
    if (!Number.isInteger(repId) || repId <= 0) {
        throw Object.assign(new Error("Invalid rep ID"), {code: 400});
    }
    return repId;
};

const post = async (req, res) => {
    try {
        const { serverPlayerId, passerPlayerId, passRating, missedServe } = req.body;

        if (!serverPlayerId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const {teamId, sessionId} = await getRepContext(req);

        const repId = await recordServeReceiveRep(req.user.userId, teamId, sessionId, {
            serverPlayerId: Number(serverPlayerId),
            passerPlayerId: passerPlayerId ? Number(passerPlayerId) : null,
            passRating,
            missedServe: missedServe === true,
        });

        return res.status(201).json({ message: "Rep recorded", repId });
    } catch (error) {
        console.error("Error processing request:", error.message || error.stack);
        return res.status(error.code || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const put = async (req, res) => {
    try {
        const {serverPlayerId, passerPlayerId, passRating, missedServe} = req.body;
        if (!serverPlayerId) {
            return res.status(400).json({error: "Missing required fields"});
        }

        const repId = getRepId(req.body.repId);
        const {teamId, sessionId} = await getRepContext(req);
        await updateServeReceiveRep(req.user.userId, teamId, sessionId, repId, {
            serverPlayerId: Number(serverPlayerId),
            passerPlayerId: passerPlayerId ? Number(passerPlayerId) : null,
            passRating,
            missedServe: missedServe === true,
        });

        return res.status(200).json({message: "Rep updated"});
    } catch (error) {
        console.error("Error processing request:", error.message || error.stack);
        return res.status(error.code || 500).json({error: error.message || "Internal Server Error"});
    }
};

const del = async (req, res) => {
    try {
        const repId = getRepId(req.body.repId);
        const {teamId, sessionId} = await getRepContext(req);
        await removeServeReceiveRep(req.user.userId, teamId, sessionId, repId);
        return res.status(200).json({message: "Rep deleted"});
    } catch (error) {
        console.error("Error processing request:", error.message || error.stack);
        return res.status(error.code || 500).json({error: error.message || "Internal Server Error"});
    }
};

export default {
    post,
    put,
    del,
};
