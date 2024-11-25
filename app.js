require('dotenv').config();

const express = require('express'); 
const session=require('express-session')
const MongoStore = require('connect-mongo');
const passport = require('passport');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoute = require('./Routes/userRoute');
const adminRoute=require('./Routes/adminRoute')
const path=require('path')
const passportSetup = require('./config/passport-setup');
const multer=require('multer')
const generateBreadcrumbs = require('./middlewares/generateBreadcrumbs');
const mongodb=require('./config/db.js')
const app = express();




const cookieParser=require('cookie-parser')


const PORT = process.env.PORT || 3000;
 


// Use the breadcrumbs middleware

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')))

app.use(generateBreadcrumbs);
app.use(session({
    secret: 'secret',  
    resave: false,
    saveUninitialized: true,
    cookie: { 
        httpOnly:true,
        maxAge: 24 * 60 * 60 * 1000
    },
   

  }));

app.use(passport.initialize());
app.use(passport.session());
// passport.serializeUser((user, done) => {
//     done(null, user.id);  
// });

// passport.deserializeUser((id, done) => {
//     User.findById(id, (err, user) => {
//         done(err, user);
//     });
// });


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/uploads/images", express.static(path.join(__dirname, "uploads/images")))
mongodb()


app.use('/', userRoute);
app.use('/admin',adminRoute)

app.use((err,req,res,next)=>{
    console.error(err.stack)
    res.status(500).json({message:err.message})
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
