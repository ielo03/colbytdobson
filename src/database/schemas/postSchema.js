import mongoose from 'mongoose';
import commentSchema from "src/mg-schema/commentSchema.js";

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
        default: 'Colby Dobson',
    },
    tags: [String],
    postedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    comments: [commentSchema]
});
const Post = mongoose.model('Post', postSchema);

export default Post;