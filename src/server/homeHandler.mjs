function get(req, res) {
    res.render("home", {
        script: "/scripts/home.js"
    });
}

export default {
    get
};