const express=require('express');
var session = require('express-session')
const mongoose=require('mongoose');
const userDB=require('../models/user');

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
    router.get('/profile',(req,res)=>{
        res.send(req.session)
        console.log("current user "+req.session);
        
    })

    router.post('/login',passport.authenticate('local',{
        failureRedirect:'/passAuth/login',
        successRedirect:'/passAuth/profile'
    }),(req,res)=>{
        res.send('Hey')
    })
    return router;
}