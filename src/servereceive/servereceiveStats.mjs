import {getTeamId} from "../utils/dbUtils.mjs";

const get = async (req, res) => {
    const teamName = decodeURIComponent(req.params.teamName);

    const teamId = await getTeamId(req.user.userId, teamName);

    if (teamId === -1) {
        return res.redirect(`/servereceive?message=Team ${teamName} not found.`);
    }

    return res.render("servereceiveStats", {
        script: "/scripts/servereceiveStats.js",
        style: "/styles/servereceive.css",
        title: `${teamName} Stats`,
        loginRequired: "true",
        teamId,
        teamName,
    });
};

export default {
    get,
};
