import express, { request } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import User from "./models/User.js";
import jwt from 'jsonwebtoken';
import Post from "./models/Post.js";
import Comment from './models/Comment.js';
import SavedPosts from './models/SavedPosts.js';

import dotenv from "dotenv";
dotenv.config();
const secret = 'secret123';

const jwtExpiration = 86400;




const app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors({
    origin: 'https://chai-stop.herokuapp.com',
   // origin: 'http://localhost:3000',
    credentials: true,
}));

// app.use(VotingRoutes);

//mongodb+srv://manisini:sonia24524738@forum.b59y0.mongodb.net/forum?retryWrites=true&w=majority
await mongoose.connect('process.env.MONGODB_URI', {useNewUrlParser:true,useUnifiedTopology:true,});
//await mongoose.connect('mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false', {useNewUrlParser:true,useUnifiedTopology:true,});
const db = mongoose.connection;
db.on('error', console.log);


function getUserFromToken(token){
    const userInfo = jwt.verify(token, secret);
        
    return User.findById(userInfo.id);
       
}




app.get('/', (req,res) => {
    res.send('ok');
})

app.post('/register', (req, res) => {
    console.log('call made');
   
    const {email,username} = req.body;
    const password = bcrypt.hashSync(req.body.password, 10);
    const user = new User({email,username,password});
    User.findOne({username: username}).exec((err,user) => {
        if(err){
            res.status(500).send({message:err});
            return;
        }

        if(user){
            
            return res.status(400).send({message: "Username already exists. Try a different one"});
        }
    })
    console.log(user);
    user.save().then(user => {
      jwt.sign({id:user._id}, secret,{expiresIn: jwtExpiration}, (err, token) => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          res.status(201).cookie('token', token).send();
          
        }
      });
    }).catch(e => {
      console.log(e);
      res.sendStatus(500);
    });
  });

app.get('/user', (req,res) =>{
    //console.log(req);
    const token = req.cookies.token;
    
    
    //console.log({token});
    // const userInfo = jwt.verify(token, secret);
        
    //     User.findById(userInfo.id)
    //         .then(user =>{
    //             res.json({username: user.username});
    //         })
    //         .catch(err =>{
    //             console.log(err);
    //             res.sendStatus(500);
    //         });
        
    getUserFromToken(token)
        .then(user =>{
            res.json({username: user.username});
        })
        .catch(err =>{
            console.log(err);
            res.sendStatus(500);
        });;
   
    
    
});


app.post('/login', (req, res) => {
    const {username, password} = req.body; 
    User.findOne({username}).then(user => {
        if(user && user.username){
            const passCorrect = bcrypt.compareSync(password, user.password);
            if(passCorrect){
                jwt.sign({id:user._id}, secret, {expiresIn: jwtExpiration}, (err,token) =>{
                    res.cookie('token', token).send();
                    
                });

            }else
            {
                res.status(422).json('Invalid username or password');
            }
        }
        else{
            res.sendStatus(422).json('Invalid username or password');
        }
    });

});
app.put('/update', (req, res) => {
    const {name,email,school,department,biography, username} = req.body;
    
    res.json(req.body);
    User.findOneAndUpdate({ "username": username }, { "$set": { "name": name, "email": email, "school": school, "department": department, "biography":biography}}).exec(function(err, user){
        if(err) {
            console.log(err);
            res.status(500).send(err);
        } 
                 res.status(200);
        
     });
     


 });


app.post('/logout', (req, res) => {
    res.cookie('token', '').send();
});

app.get('/postthread', (req,res) =>{
    
    Post.find().sort({postedAt: -1}).then(posts => {
        
        res.json(posts);

    });
   
    
    
});

app.get('/postthread/:id', (req,res) =>{
    
   

    Post.findById(req.params.id).then(post => {
        
        res.json(post);

    });
   
    
    
});

app.post('/postthread', (req,res) => {

    const token = req.cookies.token;
    console.log(token);
    if(!token){
        res.sendStatus(401);
        return;
    }
    getUserFromToken(token)
        .then(user =>{
            const {title, body} = req.body;
            const post = new Post({title, body, author: user.username, postedAt: new Date()});
            post.save().then((savedPost) => {
                res.json(savedPost);
            });
        })
        .catch(err =>{
            console.log(err);
            res.sendStatus(500);
        });
    

    


});


app.get('/comments/root/:rootId', (req,res) => {


    Comment.find({rootId: req.params.rootId}).sort({postedAt: -1}).then(comments => {
        
        res.json(comments);

    });
});

app.post('/postcomment', (req,res) => {

    const token = req.cookies.token;
    
    if(!token){
        res.sendStatus(401);
        return;
    }
    getUserFromToken(token)
        .then(user =>{
            const {body, parentId, rootId} = req.body;
            const post = new Comment({
                body, 
                author: user.username, 
                postedAt: new Date(),
                parentId,
                rootId,
            });
            post.save().then((savedComment) => {
                res.json(savedComment);
            });
        })
        .catch(err =>{
            console.log(err);
            res.sendStatus(500);
        });
    

    


});
app.post('/bookmarks', (req, res) => {
    //res.json(req.body);
    const {postId, username} = req.body;
   // const bookmarkExists = SavedPosts.exists({postId: postId, username:username});
    
    
   
        const savedPost = new SavedPosts({postId, username});
        savedPost.save(function(err, doc) {
            if (err) {
                SavedPosts.deleteOne({ postId: postId, username: username }, function(err2) {
                    if (!err2) {
                            return console.log('Post removed from bookmark');

                    }
                    else {
                            return console.log('Post removal failed');
                    }
                });
                return console.error(err);
            }
            console.log('post saved');
            res.json("ok")
          });
        
        
    });

    app.get('/savedpost', (req,res) =>{
    
   
        const username = req.query["username"];
        SavedPosts.find({username: username})
                  .populate("postId")
                  .then(function(posts){
                      res.json(posts);
                  })
                  .catch(function(err){
                        res.json(err);
                  });
       
       
    
        
        
       //res.json(username);
       
        
        
    });


    app.get('/profile', (req,res) =>{
        //console.log(req);
        const token = req.cookies.token;
        
        
        console.log({token});
        // const userInfo = jwt.verify(token, secret);
            
        //     User.findById(userInfo.id)
        //         .then(user =>{
        //             res.json({username: user.username});
        //         })
        //         .catch(err =>{
        //             console.log(err);
        //             res.sendStatus(500);
        //         });
            
        getUserFromToken(token)
            .then(user =>{
                res.json(user);
            })
            .catch(err =>{
                console.log(err);
                res.sendStatus(500);
            });;
       
        
        
    });
    
// app.get('/author/:username', (req,res) => {


//     // Comment.find({rootId: req.params.rootId}).sort({postedAt: -1}).then(comments => {
        
//     //     res.json(comments);

//     // });
//     User.findOne({username: req.params.username})
                  
//             .then(function(user){
//                 res.json(user);
//             })
//             .catch(function(err){
//                 res.json(err);
//             });

// });

    app.get('/author', (req,res) =>{
        //console.log(req);
        
        const username = req.query.username;
        console.log(username);
        User.findOne({username: username})
                  
                  .then(function(user){
                      res.json(user);
                  })
                  .catch(function(err){
                        res.json(err);
                  });
        
        
    });
    
    app.get('/userposts', (req,res) =>{
    
   
      
    
        const username = req.query.username;
        console.log(username);

      
                Post.find({author: username})
                .then(posts => {
                    res.json(posts);
                })
                .catch(function(err){
                      res.json(err);
                });
          
       
       
       
    
        
        
       //res.json(username);
       
        
        
    });




app.listen(process.env.PORT || 4000);
