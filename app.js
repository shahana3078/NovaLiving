require('dotenv').config();

const express = require('express'); 
const session=require('express-session')
const User = require("./Models/userSchema");
const passport = require('passport');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoute = require('./Routes/userRoute');
const adminRoute=require('./Routes/adminRoute')
const path=require('path')
const cookieParser=require('cookie-parser')
const passportSetup = require('./config/passport-setup');
const multer=require('multer')
const generateBreadcrumbs = require('./middlewares/generateBreadcrumbs');
const mongodb=require('./config/db.js')
const MongoStore = require('connect-mongo');
const app = express();

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')))


app.use(generateBreadcrumbs);
app.use(session({
    secret: 'secret',  
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure:false,
        httpOnly:true,
        maxAge: 24 * 60 * 60 * 1000
    },
   

  }));



app.use(passport.initialize());
app.use(passport.session());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/uploads/images", express.static(path.join(__dirname, "uploads/images")))
mongodb()


app.use('/', userRoute);
app.use('/admin',adminRoute)

app.use((req, res, next) => {
    res.status(404).render('User/404page');
});

app.use((err, req, res, next) => {
    console.error(err.stack); 
    res.status(500).render('User/500page');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
