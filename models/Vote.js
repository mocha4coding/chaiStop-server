
import mongoose from 'mongoose';


const schema = new mongoose.Schema({
    postId: {type: mongoose.ObjectId, required: false},
    votes: {type:Number, required: true, default: 0},
});

const Vote = mongoose.model('Vote', schema);

export default Vote;

