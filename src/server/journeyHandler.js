import config from "../../modules/config.js";

function get(req, res, ignored) {
    try {
        const isAdmin = config.adminId === req.session.user._id;
        res.render("journey", {
            isAdmin,
            script: "/scripts/journey.js"
        });
    } catch (err) {
        res.render("journey", {
            isAdmin: false,
            script: "/scripts/journey.js"
        });
    }
}

export default {
    get
};