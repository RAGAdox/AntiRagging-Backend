const express = require("express");
const exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
mongoose.connect('mongodb+srv://root:toor@clgdb-f31cs.mongodb.net/test?retryWrites=true',{ useNewUrlParser: true });
app.use(bodyParser.urlencoded({
    extended: false
}));
app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");
app.use('/', require('./routes/mainRouter.js'));
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => console.log("Server Started at post : " + PORT));