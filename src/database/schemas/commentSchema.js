import mongoose from "mongoose";

export const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    author: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
const Comment = mongoose.model("Comment", commentSchema);

export default Comment;