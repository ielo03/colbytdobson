import {getSessionId, getSessions, getTeamId, createSession, removeSession} from "../../utils/dbUtils.mjs";

const get = async (req, res) => {
    try {
        const teamId = await getTeamId(req.user?.userId, req.query.teamName);
        if (teamId === -1) {
            return res.status(404).json({ error: "Team not found" });
        }

        return res.status(200).json(await getSessions(req.user.userId, teamId));
    } catch (error) {
        console.error("Error processing request:", error.message || error.stack);
        return res.status(error.code || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const post = async (req, res) => {
    try {
        const { teamName, sessionName } = req.body;

        if (
            !teamName ||
            typeof teamName !== "string" ||
            !sessionName ||
            typeof sessionName !== "string" ||
            sessionName.trim().length === 0 ||
            sessionName.trim().length > 100 ||
            sessionName.includes("/") ||
            sessionName.trim().toLowerCase() === "stats"
        ) {
            return res.status(400).json({ error: "Invalid team or session name" });
        }

        const teamId = await getTeamId(req.user?.userId, teamName);
        if (teamId === -1) {
            return res.status(404).json({ error: "Team not found" });
        }

        const sessionId = await createSession(req.user.userId, teamId, sessionName.trim());
        return res.status(201).json({ message: "Session created", sessionId });
    } catch (error) {
        console.error("Error processing request:", error.message || error.stack);
        return res.status(error.code || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const del = async (req, res) => {
    try {
        const { teamName, sessionId, sessionName } = req.query;

        const teamId = await getTeamId(req.user?.userId, teamName);
        if (teamId === -1) {
            return res.status(404).json({ error: "Team not found" });
        }

        const resolvedSessionId = sessionId
            ? Number(sessionId)
            : await getSessionId(teamId, sessionName);

        if (!resolvedSessionId || resolvedSessionId === -1) {
            return res.status(404).json({ error: "Session not found" });
        }

        await removeSession(req.user.userId, teamId, resolvedSessionId);
        return res.status(200).json({ message: "Session removed" });
    } catch (error) {
        console.error("Error processing request:", error.message || error.stack);
        return res.status(error.code || 500).json({ error: error.message || "Internal Server Error" });
    }
};

export default {
    get,
    post,
    del,
};
