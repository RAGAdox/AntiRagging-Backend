const bodyParser=require("body-parser");
const members=require('./Members.js');
const uuid=require('uuid');
const router = require('express-promise-router')();
const mongoose=require('mongoose');
const userDB=require('../models/user');
router.use(bodyParser.urlencoded({ extended: false }));
router.get('/',(req,res)=>{
    res.send("Auth Router");
})
//json rendering of All members
router.get('/api',(req,res)=>{
    //res.json(members);
    userDB.find()
    .exec()
    .then(doc=>{
        res.json(doc);
    });
})
//Add User in MongoDB
router.post('/api/save',(req,res)=>{
   const userModel = new userDB({
    _id: new mongoose.Types.ObjectId(),
    email: req.body.email,
    username:req.body.username,
    password:req.body.password,
    staffStatus:req.body.staffStatus
    });
    userModel.save().then(result => {
        res.json(result)
    }).catch(err => console.log('Error Ocured ' + err));

})

//json delete a member using name and render all members
router.delete('/api/del/name',(req,res)=>{
    for(var i=0;i<members.length;i++){
        if(members[i].name==req.body.name){
            console.log(members[i])
            //members[i]==null;
            members.splice(i,1);
            
        }
    } 
    res.redirect('/auth/api');
})
//joson delete a user using id and render all members
/*
router.delete('/api/del/name',(req,res)=>{
    //same as delete using name
})
*/

module.exports = router;