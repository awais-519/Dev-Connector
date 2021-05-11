const mongoose = require('mongoose');

//CRATING USER DATA SCHEMA FOR THE DATABASE
const userSchema = new mongoose.Schema({
    
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    avatar:{
        type: String
    },
    date:{
        type: Date,
        default: Date.now
    }

});

module.exports = User = mongoose.model('user' , userSchema);