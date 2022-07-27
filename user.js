const express = require("express");
const { route } = require("./setting");
const router = express.Router();
const db_connection = require('./db_setting/connection').connection;

const passport = require('passport')
    , LocalStrategy =require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function(username, password, done){
        db_connection.get('SELECT * FROM CLIENTS WHERE USERNAME = ? AND PASSWORD = ?',[username, password],(error, user)=>{
            if(error) return(done(error));
            if(user === undefined)   {
                return(done(null, false, {message:'کاربری با این مشخصات یافت نشد.'}));
            }else if(user._ID <= 0){
                return(done(null, false, {message:'کاربری با این مشخصات یافت نشد.'}));
            }
            return(done(null, user));
        })
    }
));

passport.serializeUser(function(user, done){
    done(null, user._ID);
});

passport.deserializeUser(function(id, done){
    db_connection.get('SELECT * FROM CLIENTS WHERE _ID = ?', [id], (error, user)=>{
        done(error, user);
    })
});

router.post('/login', passport.authenticate('local', { failureRedirect:'/',
                                                        successRedirect :'/get',
                                                        failureFlash : true})
);
// router.post('/login',(req,res)=>{
//     if(req.body.username == "" || req.body.username.length <= 0 || req.body.password == "" || req.body.password.length <= 0)
//         res.status(401).send("شناسه کاربری و رمز عبور نمی‌تواند خالی باشد.");

//     let q = `SELECT _ID FROM CLIENTS WHERE USERNAME = ? AND PASSWORD = ?`;
//     db_connection.get(q,[req.body.username, req.body.password],(error, row)=>{
//         if(row === undefined)
//             res.status(401).send("کاربری با این مشخصات یافت نشد.");
//         else if(row._ID <= 0)
//             res.status(401).send("کاربری با این مشخصات یافت نشد.");
//         else{
//             res.status(200).send('success');
//             //res.redirect('/get');
//         }
//     })
// });
module.exports = router;