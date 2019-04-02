const express=require('express');
var session = require('express-session')
const mongoose=require('mongoose');
const userDB=require('../models/user');
const complainDB=require('../models/complain.js')
let jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator/check');
const token=require('../middleware/token')
var router=express.Router();
module.exports=function(passport)
{
    router.post('/signup',[
        check('email').isEmail(),
        check('username').isLength({ min: 5 }),
        check('name').isLength({min:1}),
        check('password').isLength({ min: 5 }),
        check('collegeName').isLength({min:1}),
        check('presentAddress').isLength({min:1}),
        check('phoneNumber').isLength({min:1}),
    ],(req,res)=>{
        console.log('POST SIGNUP USING PASSPORT');
        const error=validationResult(req);
        if(!error.isEmpty()){
            return res.status(422).json({success:false,message: error.array() });
        }
        var username=req.body.username,
            email=req.body.email,
            password=req.body.password,
            staffStatus=req.body.staffStatus,
            collegeName=req.body.collegeName,
            presentAddress=req.body.presentAddress,
            name=req.body.name,
            phoneNumber=req.body.phoneNumber;
        userDB.findOne({username:username},(err,doc)=>{
            if(err){res.status(500).json({success:false,error:err})}
            else{
                if(doc){
                    res.status(500).json({success:false,message:'Username Already Taken'})
                }
                else{
                    var newUser=new userDB();
                    newUser._id=new mongoose.Types.ObjectId(),
                    newUser.username=username;
                    newUser.email=email;
                    newUser.staffStatus=staffStatus;
                    newUser.password=newUser.hashPassword(password);
                    newUser.collegeName=collegeName;
                    newUser.presentAddress=presentAddress;
                    newUser.phoneNumber=phoneNumber;
                    newUser.name=name;
                    newUser.save(function(err,user){
                        if(err)
                            res.status(500).json({success:false,error:err})
                        else{
                            res.json({success:true,user:user})
                        }
                    })
                }
            }
        })
    });
    router.get('/profile',token.checkToken,(req,res)=>{
        
        username=req.headers['username']
        console.log('header username= '+username)
        if(req.headers['username']='')
            res.json({
                success:false,
                message:'username not provided'
            })
        else
        {
            userDB.findOne({username:username},(err,doc)=>{
                console.log('doc = '+doc)
                if(err){
                   res.json({
                       success:false,
                       message:'Server Error'
                   })
                }
                else if(!doc){
                    res.json({
                        success:false,
                        message:'user not found'
                    })
                }
                else if(doc){
                    res.json({
                        success:true,
                        message:'user found',
                        user:doc
                    })
                   
                   
                }
            })
        }
        /*userDB.findOne({username:req.headers['username']},(err,doc)=>{
            if(err){
                res.json({
                    success:false,
                    message:'Server Error'
                })
            }
            else if(!doc){
                res.json({
                    success:false,
                    message:'User not found/Problem in authentication'
                })
            }
            else if(doc){
                res.json({
                    success:true,
                    user:doc
                })
            }
        })*/        
    })
    router.post('/complain',token.checkToken,(req,res)=>{
        var newComplain=new complainDB()
        newComplain._id=new mongoose.Types.ObjectId()
        newComplain.username=req.headers['username']
        newComplain.name=req.headers['username']
        if(req.body.ragger)
            newComplain.ragger=req.body.ragger
        else
            newComplain.ragger=''
        newComplain.locationLongitude=req.body.locationLongitude
        newComplain.locationLatitude=req.body.locationLatitude
        newComplain.save(function(err,complain){
            if(err)
                res.status(500).json({success:false,error:err,message:'Server Error Occured'})
            else{
                res.json({success:true,complain:complain,message:'Complain Registered'})
            }
        })
    })
    router.post('/help',token.checkToken,(req,res)=>{
        var newComplain=new complainDB()
        newComplain._id=new mongoose.Types.ObjectId()
        newComplain.username=req.headers['username']
        if(req.body.name)
            newComplain.name=req.body.name
        else
            newComplain.name=''
        if(req.body.ragger)
            newComplain.ragger=req.body.ragger
        else
            newComplain.ragger=''
        newComplain.save(function(err,complain){
            if(err)
                res.status(500).json({success:false,error:err,message:'Server Error Occured'})
            else{
                res.json({success:true,complain:complain,message:'Complain Registered'})
            }
        })
    })
    router.post('/login',(req,res,next)=>{
        passport.authenticate('login-user',{session:false},(err,user,info)=>{
            if(err||!user){
                res.json(info)
            }
            else{
                req.login({username:user.username,password:user.password},{session:false},err=>{
                    if(err){
                        res.json({
                            success:false,
                            message:'Server Error'
                        })
                    }
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
                })
            }
        })(req,res,next);
    })
    /*router.post('/login',passport.authenticate('local-user',{
        session:false
    }),(req,res)=>{
        console.log(req);
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
    })*/
    return router;
}