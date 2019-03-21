//passport configuration
const localStrategy=require('passport-local').Strategy;
const userDB=require('./models/user');
module.exports=function(passport){
    passport.serializeUser((user,done)=>{
        done(null,user)
    })
    passport.deserializeUser((user,done)=>{
        done(null,user)
    })
    passport.use(new localStrategy((username,password,done)=>{
        console.log(username,password);
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
                        done(null,false)
                    }
                }
                else{
                    done(null,false);
                }
            }
        })
    }))
}