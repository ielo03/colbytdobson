function get(req, res, next) {
    req.session.destroy();
    res.redirect("/");
}

export default {
    get
}