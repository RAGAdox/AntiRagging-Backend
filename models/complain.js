const mongoose = require('mongoose');
const complainSchema=new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    username:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    ragger:{
        type:String,
        required:false
    }
});
const complaint=mongoose.model('complain',complainSchema);
module.exports=complaint;