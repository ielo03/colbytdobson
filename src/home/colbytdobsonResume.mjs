const get = (req, res) => {
    res.render("resume", {
        style: "/styles/resume.css"
    });
};

export default {
    get
};