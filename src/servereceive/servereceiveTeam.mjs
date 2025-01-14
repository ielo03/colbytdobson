const get = (req, res) => {
    res.render("servereceiveTeam", {
        script: "/scripts/servereceiveTeam.js",
        title: `Manage ${decodeURIComponent(req.url.split("/")[2])}`,
        loginRequired: "true"
    });
};

export default {
    get
};