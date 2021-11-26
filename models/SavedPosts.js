
import mongoose from 'mongoose';


const schema = new mongoose.Schema({
    postId: {type: mongoose.ObjectId, required: true, ref: 'Post'},
    username: {type: String, required: true},
    // posts :[{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}]
});
schema.index({postId: 1, username: 1}, {unique: true});
const SavedPosts = mongoose.model('SavedPosts', schema);

export default SavedPosts;
