const express = require("express");
var session = require("express-session");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const complainDB = require("../models/complain.js");
let jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator/check");
const token = require("../middleware/token");
const recepients = require("../helpers/recepients");
const userDB = require("../models/user");
var router = express.Router();
module.exports = function(passport) {
  async function main(username, complain) {
    var transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "antiragging.kgec.19@gmail.com",
        pass: "Rishi@1997"
      }
      /*auth: {
        user: process.env.SMTP_SERVER_EMAIL_ID,
        pass: process.env.SMTP_SERVER_EMAIL_PWD
      }*/
      /*auth: {
              user: "espektro@kgec.edu.in" ,
              pass: "Espektro@kgec"
            }*/
    });
    let mailOptions = "";

    userDB.findOne({ username: username }, (err, doc) => {
      if (err) {
        res.json({ success: false, message: "database error occured" });
      } else if (!doc) {
        res.json({ success: false, message: "User Not Found" });
      } else if (doc) {
        console.log("setting mailOptions");
        mailOptions = {
          from: '"AntiRagging KGEC" <antiragging@kgec.edu.in>',
          to: doc.email + recepients.email,
          subject: "Complain Registered Against " + complain.ragger,
          html:
            "<html><body><h1>Complain Registered</h1><br><p>Name of Victim :-" +
            complain.name +
            "</p><p>Name of Ragger :-" +
            complain.ragger +
            "</p><p>Details :-" +
            complain.details +
            "</p><p>Complain Time :- " +
            complain.created_at +
            "</p><p>Attended Status :-" +
            complain.attendedStatus +
            "</p></body></html>"
        };
        let info = transporter.sendMail(mailOptions).then(() => {
          console.log("Message sent: %s", info.messageId);
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        });
      }
    });
  }

  router.get("/test", (req, res) => {
    main(req.headers.username)
      .catch(console.error)
      .then(() => res.json({ success: true, message: "Mail Sent" }));
  });
  router.post(
    "/signup",
    [
      check("email").isEmail(),
      check("username").isLength({ min: 5 }),
      check("name").isLength({ min: 1 }),
      check("password").isLength({ min: 5 }),
      check("collegeName").isLength({ min: 1 }),
      check("presentAddress").isLength({ min: 1 }),
      check("phoneNumber").isLength({ min: 1 })
    ],
    (req, res) => {
      console.log("POST SIGNUP USING PASSPORT");
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(422).json({ success: false, message: error.array() });
      }
      var username = req.body.username,
        email = req.body.email,
        password = req.body.password,
        staffStatus = req.body.staffStatus,
        collegeName = req.body.collegeName,
        presentAddress = req.body.presentAddress,
        name = req.body.name,
        superUser = req.body.superUser;
      phoneNumber = req.body.phoneNumber;
      userDB.findOne({ username: username }, (err, doc) => {
        if (err) {
          res.status(500).json({
            success: false,
            error: err,
            message: "Some Error Occured"
          });
        } else {
          if (doc) {
            res
              .status(500)
              .json({ success: false, message: "Username Already Taken" });
          } else {
            var newUser = new userDB();
            (newUser._id = new mongoose.Types.ObjectId()),
              (newUser.username = username);
            newUser.email = email;
            newUser.staffStatus = staffStatus;
            newUser.password = newUser.hashPassword(password);
            newUser.collegeName = collegeName;
            newUser.presentAddress = presentAddress;
            newUser.phoneNumber = phoneNumber;
            newUser.name = name;
            newUser.superUser = superUser || false;
            newUser.save(function(err, user) {
              if (err)
                res.status(500).json({
                  success: false,
                  error: err,
                  message: "Some Error Occured while signing up"
                });
              else {
                res.json({
                  success: true,
                  user: user,
                  message: "Signed Up successfully"
                });
              }
            });
          }
        }
      });
    }
  );
  router.get("/members", token.checkToken, (req, res, next) => {
    let superUser = [],
      staffUsers = [];
    console.log("users \n =>");
    userDB
      .find({}, (err, doc) => {
        if (doc) {
          let l = doc.length,
            i = 0;
          doc.forEach(user => {
            console.log(user);
            i++;
            if (user.activated == true) {
              if (user.staffStatus == true && user.superUser == false)
                staffUsers.push(user);
              else if (user.superUser == true) superUser.push(user);
            }
            if (i == l) {
              res.json({
                success: true,
                staffUsers: staffUsers,
                superUser: superUser
              });
              next();
            }
          });
        }
      })
      .then(() => {
        if (!staffUsers)
          res.json({ success: false, message: "some error occured" });
      });
  });
  router.get("/profile", token.checkToken, (req, res) => {
    username = req.headers["username"];
    console.log("header username= " + username);
    if ((req.headers["username"] = ""))
      res.json({
        success: false,
        message: "username not provided"
      });
    else {
      userDB.findOne({ username: username }, (err, doc) => {
        console.log("doc = " + doc);
        if (err) {
          res.json({
            success: false,
            message: "Server Error"
          });
        } else if (!doc) {
          res.json({
            success: false,
            message: "user not found"
          });
        } else if (doc) {
          res.json({
            success: true,
            message: "user found",
            user: doc
          });
        }
      });
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
  });
  router.get("/checktoken", token.checkToken, (req, res) => {
    let reqName = "";
    if (req.headers.username) {
      userDB.findOne({ username: req.headers.username }, (err, doc) => {
        if (doc) {
          console.log("USER FOUND");
          reqName = doc.name;
          res
            .status(200)
            .json({ success: true, message: "Login Verified", name: reqName });
        } else {
          res.json({ success: false, message: "Username Error", name: "" });
        }
      });
    }
  });
  router.get("/complainAll", token.checkToken, (req, res) => {
    if (req.headers.username) {
      complainDB.find({ username: req.headers.username }, (err, doc) => {
        if (doc) {
          res.json({
            success: true,
            message: "Fetch Successfull",
            complain: doc
          });
        }
      });
    }
  });
  router.post("/complain", token.checkToken, (req, res) => {
    var newComplain = new complainDB();
    newComplain._id = new mongoose.Types.ObjectId();
    newComplain.username = req.headers["username"];
    if (req.body.name) newComplain.name = req.body.name;
    else if (req.headers.name) newComplain.name = req.headers.name;
    else newComplain.name = req.headers["username"];
    if (req.body.ragger) newComplain.ragger = req.body.ragger;
    else newComplain.ragger = "";
    if (req.body.details) newComplain.details = req.body.details;
    else newComplain.details = "";
    newComplain.locationLongitude = req.body.locationLongitude;
    newComplain.locationLatitude = req.body.locationLatitude;
    console.log(newComplain);
    newComplain.save(function(err, complain) {
      if (err)
        res.status(500).json({
          success: false,
          error: err,
          message: "Server Error Occured"
        });
      else {
        console.log(req.headers.username);
        main(req.headers.username, complain)
          .catch(console.error)
          .then(() =>
            res.json({
              success: true,
              complain: complain,
              message: "Complain Registered"
            })
          );
        //res.json({success:true,complain:complain,message:'Complain Registered'})
      }
    });
  });
  router.post("/help", token.checkToken, (req, res) => {
    var newComplain = new complainDB();
    newComplain._id = new mongoose.Types.ObjectId();
    newComplain.username = req.headers["username"];
    if (req.body.name) newComplain.name = req.body.name;
    else newComplain.name = "";
    if (req.body.ragger) newComplain.ragger = req.body.ragger;
    else newComplain.ragger = "";
    newComplain.save(function(err, complain) {
      if (err)
        res.status(500).json({
          success: false,
          error: err,
          message: "Server Error Occured"
        });
      else {
        res.json({
          success: true,
          complain: complain,
          message: "Complain Registered"
        });
      }
    });
  });
  router.get("/login", (req, res) => {
    res.render("login");
  });
  router.post("/login", (req, res, next) => {
    console.log(req.body.username);
    passport.authenticate(
      "login-user",
      { session: false },
      (err, user, info) => {
        if (err || !user) {
          res.json(info);
        } else {
          req.login(
            { username: user.username, password: user.password },
            { session: false },
            err => {
              if (err) {
                res.json({
                  success: false,
                  message: "Server Error"
                });
              }
              let token = jwt.sign(
                { username: req.body.username },
                process.env.SECRET_OR_KEY,
                {
                  expiresIn: "24h" // expires in 24 hours
                }
              );
              // return the JWT token for the future API calls
              userDB.findOne({ username: req.body.username }, (err, doc) => {
                if (doc) {
                  res.json({
                    success: true,
                    message: "Authentication successful!",
                    token: token,
                    name: doc.name
                  });
                }
              });
            }
          );
        }
      }
    )(req, res, next);
  });

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
};
