const express = require("express");
const complaintsDB = require("../models/complain");
var router = express.Router();
router.use("/auth", require("./Auth.js"));
router.get("/", (req, res) => {
  let homeRes = { msg: "Requested Home" };
  res.json(homeRes);
});
router.get("/login", (req, res) => {
  res.render("login");
});
router.post("/login", (req, res, next) => {
  passport.authenticate("login-user", { session: false }, (err, user, info) => {
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
          res.json({
            success: true,
            message: "Authentication successful!",
            token: token
          });
        }
      );
    }
  })(req, res, next);
});
router.get("/complaints", (req, res) => {
  complaintsDB
    .find()
    .exec()
    .then(doc => {
      console.log(doc[0].username);
      res.render("complaints",{
      doc:doc,
      }
      );
    });
  
});
module.exports = router;
