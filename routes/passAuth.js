const express=require('express');
var session = require('express-session')
const mongoose=require('mongoose');
const userDB=require('../models/user');
let jwt = require('jsonwebtoken');
const token=require('../middleware/token')
var router=express.Router();
module.exports=function(passport)
{
    router.post('/signup',(req,res)=>{
        console.log('POST SIGNUP USING PASSPORT');
        
        var username=req.body.username,
            email=req.body.email,
            password=req.body.password,
            staffStatus=req.body.staffStatus;
        userDB.findOne({username:username},(err,doc)=>{
            if(err){res.status(500).send('error occured')}
            else{
                if(doc){
                    res.status(500).send('user already present')
                }
                else{
                    var newUser=new userDB();
                    newUser._id=new mongoose.Types.ObjectId(),
                    newUser.username=username;
                    newUser.email=email;
                    newUser.staffStatus=staffStatus;
                    newUser.password=newUser.hashPassword(password)
                    newUser.save(function(err,user){
                        if(err)
                            res.status(500).send('DB error'+err)
                        else{
                            res.json(user)
                        }
                    })
                }
            }
        })
    });
    router.get('/profile',token.checkToken,(req,res)=>{
        res.json({
            success: true,
            message: 'Index page'
          });
        
    })

    router.post('/login',passport.authenticate('local',{
        failureRedirect:'/passAuth/login'
        //successRedirect:'/passAuth/profile'
    }),(req,res)=>{
        let token = jwt.sign({username: req.body.username},
            process.env.SECRET_OR_KEY,
            { expiresIn: '24h' // expires in 24 hours
            }
          );
          // return the JWT token for the future API calls
          res.json({
            success: true,
            message: 'Authentication successful!',
            token: token
          });
       // console.log(res)
    })
    return router;
}