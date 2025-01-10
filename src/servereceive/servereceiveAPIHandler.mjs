const servereceiveAPIHandler = (req, res) => {
    res.render("home", {
        style: "/styles/home.css",
        script: "/scripts/home.js"
    });
};

export default servereceiveAPIHandler;