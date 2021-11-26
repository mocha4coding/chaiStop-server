
import mongoose from 'mongoose';


const schema = new mongoose.Schema({
    author:{type:String, required: true},
    postId: {type: mongoose.ObjectId, required: false},
    direction: {type:Number, required: true},
});

const Voter = mongoose.model('voter', schema);

export default Voter;

