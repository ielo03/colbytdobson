function get (req, res, _) {
    /* This delay is bad practice, but is so much
        simpler than AJAX for all html, scripts, css
        and getting going back to work too. Only 500ms
     */
    setTimeout(function() {
        res.render("resume");
    }, 500);
}

export default {
    get
}