const get = (req, res) => {
    res.render("questionablecocktailsAbout", {
        style: "/styles/questionablecocktails.css",
        title: "About Questionable Cocktails",
    });
};

export default {
    get
};