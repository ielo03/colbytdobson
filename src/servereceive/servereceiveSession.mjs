import {getSessionId, getTeamId} from "../utils/dbUtils.mjs";

const get = async (req, res) => {
    const teamName = decodeURIComponent(req.params.teamName);
    const sessionName = decodeURIComponent(req.params.sessionName);

    const teamId = await getTeamId(req.user.userId, teamName)
    if (teamId === -1) {
        return res.redirect(`/servereceive?message=Team ${teamName} not found.`);
    }

    const sessionId = await getSessionId(teamId, sessionName);
    if (sessionId === -1) {
        return res.redirect(`/servereceive/${teamName}?message=Session ${sessionName} not found.`);
    }

    return res.render("servereceiveSession", {
        script: "/scripts/servereceiveSession.js",
        style: "/styles/servereceive.css",
        title: `Record ${sessionName}`,
        loginRequired: "true",
        teamId: teamId,
        sessionId: sessionId,
    });
};

export default {
    get
};