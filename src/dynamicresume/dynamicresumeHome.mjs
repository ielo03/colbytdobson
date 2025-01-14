const get = (req, res) => {
    res.render("dynamicresumeHome", {
        style: "/styles/dynamicresumeHome.css",
        script: "/scripts/dynamicresumeHome.js",
        title: "Dynamic Resume Generator",
        loginRequired: "true"
    });
};

export default {
    get
};