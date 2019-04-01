//passport configuration
const passport=require('passport');
const localStrategy=require('passport-local').Strategy;
const userDB=require('./models/user');
module.exports=function(passport){
    passport.serializeUser((user,done)=>{
        done(null,user)
    })
    passport.deserializeUser((user,done)=>{
        done(null,user)
    })
    passport.use('login-user',new localStrategy({username:'username',password:'password'},(username,password,done)=>{
        userDB.findOne({username:username},(err,doc)=>{
            if(err){
                return done(err,false,{
                    success:false,
                    message:'server error'
                });
            }
            else if(!doc){
                return done(null,false,{
                    success:false,
                    message:'User Not Found'
                });
            }
            else if(doc){
                if(!doc.comparePassword(password,doc.password)){
                    return done(null,false,{
                        success:false,
                        message:'Invalid Password from passport.js'
                    });
                }
                else{
                    return done(null,doc,{
                        success:true,
                        message:'Login Successfull'
                    });
                }
            }
        })
    }))
    /*passport.use(new localStrategy((username,password,done)=>{
        
        userDB.findOne({username:username},(err,doc)=>{
            if(err){done(err)}
            else{
                if(doc){
                    var valid=doc.comparePassword(password,doc.password)
                    if(valid){
                        done(null,{
                            username:doc.username,
                            password:doc.password,
                            staffStatus:doc.staffStatus
                        })
                    }
                    else{
                        done(null,false,{
                            success:false,
                            message:'Invalid Credentials',
                            token:''
                        })
                    }
                }
                else{
                    done(null,false,{
                        success:false,
                        message:'Username Invalid',
                        token:''
                    });
                }
            }
        })
    }))*/
}