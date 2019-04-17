const express = require("express");
const session = require("express-session");
const cookieParser=require('cookie-parser')
const complaintsDB = require("../models/complain");
const userDB=require('../models/user')
const sessionChecker=require('../middleware/sessionChecker')
var router = express.Router();
router.use(
  session({
    key: "user_sid",
    secret: "somerandonstuffs",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 600000
    }
  })
);
router.use(cookieParser());


router.get("/", (req, res) => {
  res.redirect('/complaints')
});
router.get("/login", (req, res,next) => {
  res.render("login");
});
router.post("/login", (req, res,next) => {
console.log(req.body.username)

  userDB.findOne({username:req.body.username},(err,userVal)=>{
      if(err){
          res.send('DATABASE ERROR OCCURED')
      }
      else if(!userVal){
          res.send('User Not Found')
      }
      else if(userVal){
        if(!userVal.comparePassword(req.body.password,userVal.password)){
            res.send('Invalid Credentials')
        }
        else{
            req.session.user = userVal
            let userCookie = req.cookies.user;
            if(userCookie===undefined)
            {
                res.cookie('user',userVal, { maxAge: 900000, httpOnly: true });
            }
           
            //next()

            res.redirect('/complaints')
        }
      }
    })
});
router.get('/check',(req,res,next)=>{
    if (req.session.user || req.cookies.user) {
        res.send('Logged In')
      } else {
        res.redirect('/login')
      }
})

router.get("/complaints",sessionChecker, (req, res) => {
  console.log(req);
  complaintsDB
    .find()
    .exec()
    .then(doc => {
      res.render("complaints", {
        doc: doc
      });
    });
});
router.post("/statusUpdate", (req, res) => {
  console.log(req.body.attended);
  console.log(req.query.id);
  complaintsDB.findOneAndUpdate(
    { _id: req.query.id },
    { attendedStatus: true },
    (err, doc) => {
      if (err) {
        res.send("some database error occured");
      } else if (!doc) {
        res.send("document not found");
      } else {
        res.redirect("/complaints");
      }
    }
  );
});
module.exports = router;
