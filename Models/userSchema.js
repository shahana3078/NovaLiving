
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    phoneNumber: {
        type: String, 
        required: false,
    },
    password: {
        type: String,
        
    },
    created_at: {
        type: Date,
        default: Date.now,
        immutable: true,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    otp:{
        type:String,
    },
    otpExpires:{
        type:Date
    },
    resetToken: { 
        type: String,
    },
    resetTokenExpires: { 
        type: Date,
    },
    googleId: { 
        type: String, required: false
    },
    isBlocked: { 
        type: Boolean, default: false
     },
     dateJoined: {
        type: Date,
        default: Date.now 
    },
    referralCode: String, 
  referredBy: String, 

});




const User = mongoose.model('User', UserSchema);

module.exports = User; 
