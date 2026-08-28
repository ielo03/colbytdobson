const servereceive = (req, res) => {
    const regex = /^\/sr/;
    const path = "/servereceive";
    const newPath = req.originalUrl.replace(regex, path);
    return res.redirect(301, newPath);
};

const questionablecocktails = (req, res) => {
    const regex = /^\/qc/;
    const path = "/questionablecocktails";
    const newPath = req.originalUrl.replace(regex, path);
    return res.redirect(301, newPath);
};

const myresume = (req, res) => {
    const regex = /^\/r/;
    const path = "/resume";
    const newPath = req.originalUrl.replace(regex, path);
    return res.redirect(301, newPath);
};

export default {
    servereceive,
    questionablecocktails,
    myresume,
};
