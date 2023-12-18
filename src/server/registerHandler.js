import User from "../database/schemas/userSchema.js";

function get(req, res, ignored) {
    if (req.session.user) {
        res.redirect("/journey");
        return;
    }
    res.render("register", {
        script: "/scripts/register.js"
    });
}

async function post(req, res, next) {
    const {username, password} = req.body;

    const checkUser = await User.findOne({username});
    if (checkUser) {
        res.status(400).contentType("text/plain").send("Username already taken");
        return;
    }

    const user = new User({username, password});

    user.save()
        .then((doc) => {
            console.log("Successfully added user: " + doc);
            req.session.user = doc;
            res.status(200).contentType("text/plain").send("OK");
        })
        .catch((err) => {
            console.log("Failed to add user: " + err);
            res.status(400).contentType("text/plain").send("Username or password not valid");
        });
}

export default {
    get,
    post
};