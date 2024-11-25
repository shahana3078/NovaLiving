const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, 
        index: true,  
    },
    otp: {
        type: String,
        required: true,
        minlength: 6, 
        maxlength: 6, 
    },
    expiry: {
        type: Date,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
        immutable: true,
    },
});

const OTP = mongoose.model('OTP', OTPSchema);
module.exports = OTP;

