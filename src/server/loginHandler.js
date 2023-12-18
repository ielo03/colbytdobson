import bcrypt from "bcrypt";
import User from "../database/schemas/userSchema.js";

function get(req, res, ignored) {
    if (req.session.user) {
        res.redirect("/journey");
        return;
    }
    res.render("login", {
        script: "/scripts/login.js",
        style: "/styles/login.css"
    });
}

async function post(req, res, next) {
    const {username, password} = req.body;

    const user = await User.findOne({username});
    if (!user) {
        res.status(400).contentType("text/plain").send("Invalid username or password");
        return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(400).contentType("text/plain").send("Invalid username or password");
        return;
    }

    req.session.user = user;
    res.status(200).send('OK');
}

export default {
    get,
    post
};