const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const passAuth = require("./routes/passAuth")(passport);
const userDB = require("./models/user");
const recepients = require("./helpers/recepients");
require("./passport")(passport);
const app = express();
mongoose
  .connect(
    "mongodb+srv://root:toor@clgdb-f31cs.mongodb.net/users?retryWrites=true",
    { useNewUrlParser: true }
  )
  .catch(console.log("An error occured"));
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.use(
  session({
    secret: "thesecret",
    saveUninitialized: false,
    resave: false
  })
);
app.set("view engine", "handlebars");
app.use(passport.initialize());
app.use(passport.session());
app.use("/", require("./routes/mainRouter.js"));
app.use("/passAuth", passAuth);
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  //console.log(recepients);
  let dummyuser = new userDB();
  console.log(dummyuser.hashPassword("RAGAdox"));
  console.log("Server Started at " + PORT);
});
userDB.find({ staffStatus: true }, (err, doc) => {
  if (err) {
    console.log("Database Error occured");
  } else if (doc) {
    recepients.email = "";
    console.log(recepients.email);
    let i = 0,
      l = doc.length;
    doc.forEach(element => {
      i++;
      if (element.email != undefined) recepients.email += "," + element.email;
      if (i == l - 1) {
        app.listen(PORT, () => {
          //console.log(recepients);
          console.log("Server Started at " + PORT);
        });
      }
    });
  } else if (!doc) {
    console.log("NO SUPER USER FOUND");
    app.listen(PORT, () => {
      //console.log(recepients);
      console.log("Server Started at " + PORT);
    });
  }
});
