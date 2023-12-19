import Post from "../database/schemas/postSchema.js";
import config from "../../modules/config.js";

function get (req, res, next) {
    const user = req.session.user;

    if (user._id !== config.adminId) {
        const err = new Error("Unauthorized user");
        err.code = 401;
        next(err);
        return;
    }

    res.render("createPost", {
        script: "/scripts/createPost.js"
    });
}

function post (req, res, next) {
    const user = req.session.user;

    if (user._id !== config.adminId) {
        res.status(401).contentType("text/plain").send("Unauthorized user");
        return;
    }

    const title = req.body.title || "";
    const content = req.body.content || "";

    if (title === "" || content === "") {
        res.status(400).contentType("text/plain").send("Title and body required");
        return;
    }

    const post = new Post({userId: user._id, title, content});
    post.save()
        .then((doc) => {
            console.log("Successfully added post: " + doc);
            res.status(200).contentType("text/plain").send("OK");
        })
        .catch((err) => {
            console.log("Failed to add user: " + err);
            res.status(400).contentType("text/plain").send("Failed to add post");
        });
}

export default {
    get,
    post
}