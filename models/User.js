import mongoose from 'mongoose';

 const schema=  new mongoose.Schema({
    email:{type:String, required: true},
    username: {type:String, required: true, unique:true, dropDups: true},
    password: {type:String, required: true},
    name: {type:String, default: ''},
    school: {type:String, default : ''},
    department: {type: String, default : ''},
    biography: {type:String, default: ''},

   
});

const User = mongoose.model('User', schema);
export default User;