import mongoose from "mongoose";
import { commentSchema } from "./commentSchema.js";

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true,
        default: "Colby Dobson"
    },
    tags: [String],
    updatedAt: {
        type: Date,
        default: Date.now
    },
    comments: [commentSchema]
});

postSchema.set('toJSON', { virtuals: true });

postSchema.virtual('date').get(function() {
    return this._id.getTimestamp();
});

const Post = mongoose.model("Post", postSchema);

export default Post;