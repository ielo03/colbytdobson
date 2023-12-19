import Post from "../database/schemas/postSchema.js";

function get(req, res, next) {
    Post.find({}, 'author title content date -_id', (err, posts) => {
        if (err) {
            next(err);
            return;
        }

        res.json(posts);
    });
}

export default {
    get
}