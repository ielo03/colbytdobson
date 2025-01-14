const get = (req, res) => {
    res.render("servereceiveHome", {
        script: "/scripts/servereceiveHome.js",
        title: "Serve Receive Tracker",
        loginRequired: "true"
    });
};

export default {
    get
};