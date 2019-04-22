const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const complaintsDB = require("../models/complain");
const userDB = require("../models/user");
const sessionChecker = require("../middleware/sessionChecker");
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
async function main(username, complain, staff) {
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
    } else {
      mailOptions = {
        from: '"AntiRagging KGEC" <antiragging@kgec.edu.in>',
        to: doc.email,
        subject:
          "Complain Against " + complain.ragger + " was attended by " + staff,
        html:
          "<html><body><h1>Complain Registered</h1><br><p>Name of Victim :-" +
          complain.name +
          "</p><p>Name of Ragger :-" +
          complain.ragger +
          "</p><p>Complain Time :- " +
          complain.created_at +
          "</p><p>Attended Status :-" +
          true +
          "</p></body></html>"
      };
      let info = transporter.sendMail(mailOptions).then(() => {
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      });
    }
  });
}

router.get("/", (req, res) => {
  res.redirect("/complaints");
});
router.get("/login", (req, res, next) => {
  res.render("login");
});
router.post("/login", (req, res, next) => {
  //console.log(req.body.username)

  userDB.findOne({ username: req.body.username }, (err, userVal) => {
    if (err) {
      res.send("DATABASE ERROR OCCURED");
    } else if (!userVal) {
      res.render("login", { msg: "User Not Found" });
    } else if (userVal) {
      if (!userVal.comparePassword(req.body.password, userVal.password)) {
        res.render("login", { msg: "Invalid Credentials" });
      } else if (userVal.staffStatus == true) {
        req.session.user = userVal;
        let userCookie = req.cookies.user;
        if (userCookie === undefined) {
          res.cookie("user", userVal, { maxAge: 900000, httpOnly: true });
        }

        //next()

        res.redirect("/complaints");
      } else {
        res.render("login", { msg: "Not a Authorized User" });
      }
    }
  });
});
router.get("/logout", (req, res) => {
  if (req.session.user || req.cookies.user) {
    req.session.user = null;
    res.clearCookie("user");
    console.log("Logged out");
    res.redirect("/login");
  } else {
    res.redirect("/login");
  }
});
router.get("/check", (req, res, next) => {
  if (req.session.user || req.cookies.user) {
    res.send("Logged In");
  } else {
    res.redirect("/login");
  }
});
router.get("/signup", sessionChecker, (req, res) => {
  let user = req.session.user || req.cookies.user;
  if (user) {
    res.render("signup");
  }
});
router.post("/signup", sessionChecker, (req, res) => {
  var username = req.body.username,
    email = req.body.email,
    password = req.body.password,
    staffStatus = true,
    collegeName = req.body.collegeName,
    presentAddress = req.body.presentAddress,
    name = req.body.name,
    superUser = false,
    phoneNumber = req.body.phoneNumber;
  userDB.findOne({ username: username }, (err, doc) => {
    if (err) {
      res.render("signup", {
        success: false,
        error: err,
        message: "Some Internal Error Occured"
      });
    } else {
      if (doc) {
        res.render("signup", {
          success: false,
          message: "Username Already Taken"
        });
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
        newUser.save(function (err, user) {
          if (err)
            res.status(500).json({
              success: false,
              error: err,
              message: "Some Error Occured while signing up"
            });
          else {
            //res.json({success:true,user:user,message:'Signed Up successfully'})
            res.render("signup", {
              success: true,
              user: user,
              message: "Signed Up Successfully"
            });
          }
        });
      }
    }
  });
});

router.get("/complaints", sessionChecker, (req, res) => {
  //console.log(req);
  complaintsDB
    .find()
    .exec()
    .then(doc => {
      res.render("complaints", {
        doc: doc,
        user: req.session.user || req.cookies.user,
        curURL: req.protocol + "://" + req.get("host")
      });
    });
});
router.get("/resetpassword", sessionChecker, (req, res) => {
  res.render("reset");
});
router.post("/resetpassword", sessionChecker, (req, res) => {
  //console.log(req.session.user.username,req.cookies.user.username)
  let username = "";
  if (req.session.user) username = req.session.user.username;
  else username = req.cookies.user.username;
  userDB.findOne({ username: username }, (err, doc) => {
    if (doc) {
      if (doc.comparePassword(req.body.oldpassword, doc.password)) {
        console.log("Old Password is correct");
        var newpassword = doc.hashPassword(req.body.newpassword);
        userDB.findOneAndUpdate(
          { username: username },
          { password: newpassword },
          (err, doc) => {
            if (err) {
              res.render("reset", {
                msg: "PASSWORD RESET UNSUCCESSFULL"
              });
            } else if (!doc) {
              res.render("reset", {
                msg: "PASSWORD RESET UNSUCCESSFULL"
              });
            } else if (doc) {
              req.session.user = null;
              res.clearCookie("user");
              res.render("login", {
                msg: "PASSWORD RESET SUCCESSFULL"
              });
            }
          }
        );
      }
    }
  });
});
router.post("/statusUpdate", sessionChecker, (req, res) => {
  //console.log(req.body.attended);
  //console.log(req.query.id);
  complaintsDB.findOneAndUpdate(
    { _id: req.query.id },
    { attendedStatus: true },
    (err, doc) => {
      if (err) {
        res.send("some database error occured");
      } else if (!doc) {
        res.send("  document not found");
      } else {
        let username = "";
        if (req.session.user) username = req.session.user.name;
        else username = req.cookies.user.name;

        main(doc.username, doc, username).then(() =>
          res.redirect("/complaints")
        );
      }
    }
  );
});
router.get("/update", sessionChecker, (req, res) => {
  if (req.session.user)
    res.render("update", {
      user: req.session.user
    });
  else
    res.render("update", {
      user: req.cookies.user
    });
});
router.post("/update", sessionChecker, (req, res) => {
  let username = "";
  if (req.session.user) username = req.session.user.username;
  else username = req.session.user.username;
  let email = req.body.email,
    collegeName = req.body.collegeName;
  presentAddress = req.body.presentAddress;
  (phoneNumber = req.body.phoneNumber),
    userDB.findOneAndUpdate(
      { username: username },
      {
        email: email,
        collegeName: collegeName,
        presentAddress: presentAddress,
        phoneNumber: phoneNumber
      },
      (err, doc) => {
        if (doc) {
          if (req.session.user || req.cookies.user) {
            req.session.user = null;
            res.clearCookie("user");
            console.log("Logged out");
          }
          res.render("update", {
            message: "Profile Updation Successfull"
          });
        } else {
          res.send("Some Error Occured");
        }
      }
    );
});
module.exports = router;
