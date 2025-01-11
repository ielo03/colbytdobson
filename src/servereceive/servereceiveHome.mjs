const get = (req, res) => {
    res.render("servereceiveHome", {
        script: "/scripts/servereceiveHome.js"
    });
};

export default {
    get
};