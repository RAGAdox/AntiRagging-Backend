const bodyParser=require("body-parser");
const members=require('./Members.js');
const router = require('express-promise-router')();
const mongoose=require('mongoose');
const userDB=require('../models/user');
const verifyToken=require('../middleware/token')
router.use(bodyParser.urlencoded({ extended: false }));
router.get('/',(req,res)=>{
    res.send("Auth Router");
})
//json rendering of All members
router.get('/api',(req,res)=>{
    //res.json(members);
    //console.log(req.session.passport.user.staffStatus);
    if(req.session.passport)
    {
        if(req.session.passport.user.staffStatus===true)
            {
                userDB.find()
                .exec()
                .then(doc=>{
                    res.json(doc);
            });
            }
        else
            res.send('Not Authorized')
    }
    else
        res.send('not logged in')
})
module.exports = router;