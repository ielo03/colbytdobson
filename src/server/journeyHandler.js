import config from "../../modules/config.js";

function get(req, res, _) {
    /* This delay is bad practice, but is so much
        simpler than AJAX for all html, scripts, css
        and getting going back to work too. Only 500ms
     */
    setTimeout(function() {
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
    }, 500);
}

export default {
    get
};