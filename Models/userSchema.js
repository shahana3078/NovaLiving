
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
    resetToken: { // Field for password reset token
        type: String,
    },
    resetTokenExpires: { // Field for password reset token expiration
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

});




const User = mongoose.model('User', UserSchema);

module.exports = User; // Export the User model
