const bcrypt = require("bcrypt");
require('dotenv').config();
const User = require("../../Models/userSchema");
const OTP = require("../../Models/OTPSchema");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const passport = require("passport");
const Wallet=require('../../Models/walletModel')

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL,
    pass: process.env.MAIL_PASSWORD,
  },
});

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: "novaliving4@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });
};

const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

//SIGNUP

const getSignup = (req, res) => {
  const referralCode = req.query.ref || "";
  res.set("Cache-Control", "no-store");
  res.render("User/signup", { error: null, full_name: "", email: "" ,ref: referralCode});
};

const postSignup = async (req, res) => {
  const { full_name, email, password,ref } = req.body;
  const referredBy =ref || null; 

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (!existingUser.isVerified) {
        return res.render("User/verify-otp", { email });
      }

      return res.render("User/signup", {
        error: "Email already registered and verified. Please login.",
        full_name,
        email,
      });
    }

    const hashedPassword = await hashPassword(password);
    const otp = generateOtp();
    console.log( otp);
   

    const newReferralCode = Math.random().toString(36).substring(2, 8);

   
    const newUser = new User({
      full_name,
      email,
      password: hashedPassword,
      referralCode: newReferralCode, 
      referredBy,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000,   
    });
    console.log(otp);

    await newUser.save();

 
   if (referredBy) {
    const referrer = await User.findById(referredBy);

    if (referrer) {
      let wallet = await Wallet.findOne({ userId: referredBy });

      if (!wallet) {
        wallet = new Wallet({
          userId: referredBy,
          balance: 0,
          transactions: [],
        });
      }

      const alreadyCredited = wallet.transactions.some(
        (t) => t.description === `Referral bonus for user ${newUser._id}`
      );

      if (!alreadyCredited) {
        wallet.balance += 200;

        wallet.transactions.push({
          amount: 200,
          type: "credit",
          description: `Referral bonus for user ${newUser._id}`,
          date: new Date(),
        });

        await wallet.save();
        console.log(`₹200 credited to referrer: ${referredBy}`);
      }
    } else {
      console.log("Referrer not found!");
    }
  }

  
    await sendOtpEmail(email, otp);
    res.render("User/verify-otp", { email });
  } catch (error) {
    console.error("Error during signup", error);
    res.status(500).send("Error during signup");
  }
};



//OTP verification page

const getVerifyOtp = (req, res) => {
  const { email } = req.query;
  res.render("User/verify-otp", { email });
};


const postVerifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      console.log('Entered wrong OTP or OTP expired');

      return res.render('User/verify-otp', {
        email,
        errorMessage: 'Invalid OTP or OTP expired!'
      });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    req.session.userId = user._id;  

    return res.render("User/login", { message: "Signup successful! You can log in now." });
  } catch (error) {
    console.error('Error occurred during OTP verification:', error);
    return res.render('User/verify-otp', {
      email,
      errorMessage: 'An error occurred during OTP verification'
    });
  }
};

//RESEND-OTP

const postResendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const otp = generateOtp();
    console.log(otp);

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; 

    await user.save();
    await sendOtpEmail(email, otp);

    res.json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    console.error("Error during OTP resend:", error);
    res
      .status(500)
      .json({ success: false, message: "Error during OTP resend" });
  }
};

//LOGIN

const getLogin = (req, res) => {
  const message = req.query.message;
  res.render("User/login", { message });
};

const postLogin = async (req, res) => {

  const { email, password } = req.body;

  try {

    if(typeof email!=='string'){
      return res.render('User/login',{
        message:'please enter a valid email'
      })
    }
    const emailReg= /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if(!emailReg.test(email)){
      return res.render("User/login", {
        message:'please enter a email address'
      })
    }
   

    const user = await User.findOne({ email });
    if (!user) {
      return res.render("User/login", {
        message: "Invalid email or password.",
      });
      
      
    }
   
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("User/login", {
        message: "Invalid email or password.",
      });
    }
   

    if (user.isBlocked) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error during session destruction:", err);
        }
        console.log("Account is blocked");
        return res.render("User/login", {
          message: "Your account has been blocked. Please contact support.",
        });
      });
    } else {
      req.session.userId = user._id;
      return res.redirect("/home");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error during login");
  }
};





const getHome = async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.session.userId); 
    if (!user) {
      return res.redirect("/login");
    }
    const product = null; 

    res.set("Cache-Control", "no-cache, no-store, must-revalidate");

    res.render("User/home", { user, product });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.redirect("/login"); 
  }
};






//FORGOT PASSWORD

const getForgotPassword = (req, res) => {
  res.render("User/forgot-password", { message: null });
};
const sendResetEmail = async (email, resetToken) => {
  const resetLink = `https://novaliving.zapto.org/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Password Reset Request",
    text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}`,
  };

  await transporter.sendMail(mailOptions);
};

const postForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render("User/forgot-password", {
        message: "Email does not exist.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000;

    await user.save();
    await sendResetEmail(email, resetToken);

    res.render("User/forgot-password", {
      message: "Reset link sent to your email.",
    });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.render("User/forgot-password", { message: "Error during password reset." });
  }
};

//RESET-PASSWORD

const getResetPassword = (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res
      .status(400)
      .render("User/forgot-password", { message: "Invalid or expired token." });
  }
  res.render("User/reset-password", { token: token, message: null });
};

const postResetPassword = async (req, res) => {
  
  const { password, confirmPassword, token } = req.body;


  try {
    if (password !== confirmPassword) {
      return res.render("User/reset-password", {
        message: "Passwords do not match.",
        token,
      });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.render("User/reset-password", {
        message: "Invalid or expired token.",
        token,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    await user.save();

   
    return res.redirect(
      "/login?message=Password has been reset successfully. You can now log in."
    );
  } catch (error) {
    console.error("Error resetting password:", error);

    return res.render("User/reset-password", {
      message:
        "An error occurred while resetting your password. Please try again.",
      token,
    });
  }
};


const googleLogin = async (req, res, next) => {
  console.log('loginned by google');
  
  passport.authenticate("google", { failureRedirect: "/login" }, async (err, user, info) => {
    if (err || !user) {
      console.error("Google Authentication Error:", err || info);
      return res.redirect("/login?message=Unable to authenticate. Please try again.");
    }

    try {

      if (!user.email) {
        console.error("Google authentication returned no email.");
        return res.redirect("/login?message=Unable to authenticate. No email returned from Google.");
      }

      req.session.userId = user._id;

      return res.redirect("/home"); 

    } catch (error) {
      console.error("Error during Google login process:", error);

      if (error.code === 11000) {
        return res.redirect("/login?message=This email is already registered. Please log in with your credentials.");
      }

      return res.redirect("/login?message=Unable to authenticate. Please try again.");
    }
  })(req, res, next); 
};





module.exports = {
  getSignup,
  postSignup,
  getVerifyOtp,
  postVerifyOtp,
  postResendOtp,
  sendOtpEmail,
  getLogin,
  postLogin,
  googleLogin,
  getHome,
  getForgotPassword,
  postForgotPassword,
  getResetPassword,
  postResetPassword,

};
