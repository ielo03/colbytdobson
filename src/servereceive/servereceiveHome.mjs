const get = (req, res) => {
    res.render("servereceiveHome", {
        script: "/scripts/servereceiveHome.js",
        style: "/styles/servereceive.css",
        title: "Serve Receive Tracker",
        loginRequired: "true"
    });
};

export default {
    get
};