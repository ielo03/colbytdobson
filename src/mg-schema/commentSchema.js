import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
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
    postedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
const Comment = mongoose.model('Comment', commentSchema);

export default Comment;