import {getTeamId} from "../utils/dbUtils.mjs";

const get = async (req, res) => {
    const teamName = decodeURIComponent(req.params.teamName);

    const teamId = await getTeamId(req.user.userId, teamName)

    if (teamId === -1) {
        res.redirect(`/servereceive?message=Team ${teamName} not found.`);
    } else {
        res.render("servereceiveTeam", {
            script: "/scripts/servereceiveTeam.js",
            style: "/styles/servereceive.css",
            title: `Manage ${teamName}`,
            loginRequired: "true",
            teamId: teamId
        });
    }
};

export default {
    get
};