const get = (req, res) => {
    res.render("uber", {
        title: "Thank You | Colby T. Dobson",
        style: "/styles/uber.css"
    });
};

export default {
    get
};
