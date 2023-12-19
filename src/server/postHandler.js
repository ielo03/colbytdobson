import Post from "../database/schemas/postSchema.js";

async function get(req, res, next) {
    try {
        const posts = await Post.find({});
        res.json(posts);
    } catch (err) {
        next(err);
    }
}

export default {
    get
}