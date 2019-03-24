const express = require("express");

var router = express.Router();
router.use('/auth', require('./Auth.js'));
router.get("/",(req,res)=>{
    res.json({msg:"Requested Home"});
})
module.exports = router;
