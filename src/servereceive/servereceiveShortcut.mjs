const get = (req, res) => {
    const newPath = req.originalUrl.replace(/^\/sr/, "/servereceive");
    res.redirect(301, newPath);
};

export default {
    get
};