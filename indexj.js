const dotenv=require('dotenv');
dotenv.config();
const express=require('express');
const app=new express();
const passport=require('passport');
const passportJWT=require('passport-jwt');
const mongoose=require('mongoose');
const userDB=require('./models/user');
const JwtStrategy=passportJWT.Strategy;
const ExtractJwt=passportJWT.ExtractJwt;
const opts ={
    jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey:process.env.SECRET_OR_KEY
};
const strategy=new JwtStrategy(opts,(payload,next)=>{
    //GET USER FROM DB
    console.log(payload);
    //userDB.findOne({_id:payload.id})
    next(null,user);
})
passport.use(strategy);
app.use(passport.initialize());
 
app.get('/',(req,res)=>{
    res.send('root of indexj \n for passportJWT')
})
const PORT=2001;
app.listen(PORT);