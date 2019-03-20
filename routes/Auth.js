const express = require("express");
const bodyParser=require("body-parser");
const members=require('./Members.js');
const uuid=require('uuid');
const router = require('express-promise-router')();
router.use(bodyParser.urlencoded({ extended: false }));
router.get('/',(req,res)=>{
    res.send("Auth Router");
})
//json rendering of All members
router.get('/api',(req,res)=>{
    res.json(members);
})
//json add and render all members
router.post('/api/save',(req,res)=>{
    const newMember={
        id:uuid.v4(),
        name:req.body.name,
        dept:req.body.dept
    }
    if(!newMember.name||!newMember.dept)
    {
        return res.status(400).json({msg:`please include a name and email`});
    }
    members.push(newMember);
    //res.json(members);
    res.redirect('/auth/api');
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