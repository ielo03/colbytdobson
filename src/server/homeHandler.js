function get(req, res) {
    res.render("home", {
        style: "/styles/home.css"
    });
}

export default {
    get
};