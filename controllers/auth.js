var bcrypt = require('bcrypt');
var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var app = express();
var request = require('request');
var db = require('../models');
var request = require('request');
var session = require('express-session');

router.use(bodyParser.urlencoded({extended:false}));

router.get('/restricted',function(req,res){
    if(req.getUser()){
        res.render('auth/restricted');
    }else{
        req.flash('danger','You are not cool enough');
        res.redirect('/');
    }
});

//GET /auth/login
//display login form
router.get('/login',function(req,res){
    res.render('auth/login');
});

// //POST /login
// //process login data and login user

router.post('/login',function(req,res){
    //do login here (check password and set session value)
    // res.send(req.body);
    db.user.find({where:{email:req.body.email}})
    	.then(function(user){
    		if(user){
    			bcrypt.compare(req.body.password, user.hashPass,function(err,result){
    				if(err) throw err;

    				if(result){
    					// store uer to session!
    					req.session.user = {
    						id:user.id,
    						email:user.email,
    						name:user.name
    					};
    					res.redirect('/');
    					// res.send('GG you can memory');
    				}else{
    					res.send('Forgot your pass? Try harder, scrub.');
    				}
    			});
    		}else{
    			res.send('Unknown user.');
    		}
    	})
    //user is logged in forward them to the home page
    // res.redirect('/');
});

//GET /auth/signup
//display sign up form
router.get('/signup',function(req,res){
    res.render('auth/signup');
});

//POST /auth/signup
//create new user in database
router.post('/signup',function(req,res){

	var userQuery={email:req.body.email};
	var userData={
		email:req.body.email,
		name:req.body.name,
		hashPass:req.body.password
	};


	db.user.findOrCreate({where:userQuery,defaults:userData})
		.spread(function(user,created){
            // res.send(user);
			if(created){
                res.redirect('/');
            }else{
                res.send('e-mail already exists.');
            }
        })
        .catch(function(error){
            console.log('sign up findorcreate error',error);
            res.send(error);
        })
    // do sign up here (add user to database)
    // res.send(req.body);
    // user is signed up forward them to the home page
});

//GET /auth/logout
//logout logged in user
router.get('/logout',function(req,res){
    delete req.session.user;
    res.redirect('/');
});


module.exports = router;