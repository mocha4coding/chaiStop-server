import mongoose from 'mongoose';

const User = mongoose.model('User', new mongoose.Schema({
    email:{type:String, required: true},
    username: {type:String, required: true},
    password: {type:String, required: true},
    name: {type:String, default: ''},
    school: {type:String, default : ''},
    department: {type: String, default : ''},
    biography: {type:String, default: ''},


}));

export default User;