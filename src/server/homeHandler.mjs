function get(req, res) {
    res.render("home", {
        style: "/stylees/home.css",
        script: "/scripts/home.js"
    });
}

export default {
    get
};