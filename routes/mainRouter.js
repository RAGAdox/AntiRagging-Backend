const express = require("express");

var router = express.Router();
router.use('/auth', require('./Auth.js'));
router.get("/",(req,res)=>{
    let homeRes={msg:"Requested Home"}
    res.json(homeRes);
})
module.exports = router;
