'use strict';

var express = require('express');
//var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var valid = require('valid-url'); 
var store = require('node-persist');
var coreUrl = require('url');


var app = express();
require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));

app.use(session({
	secret: 'secretClementine',
	resave: false,
	saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

store.initSync({
	dir: 'store'
});
app.route("/")
	.get(function(req, res){
		res.sendFile(process.cwd() + '/public/index.html');	
	});
app.route("/new/*")
	.get(function(req, res){
		var url = req.protocol + '://' + req.params[0]; 
		console.log(url); 
		
		
		if (!valid.isUri(url)) {
			res.send({error: 'Invalid url'});
		} else {
			var i = store.length() + 1;
			store.setItemSync(String(i), url);
			var domain = req.get('host'); 
			
			res.json({
				og: url,
				short: coreUrl.format({
					protocol: req.protocol, 
					host: domain}) + '/' + i
				
			});
		}
	});
	
app.route("/:id")
	.get(function(req, res){
		var id = req.params.id; 
		var url = store.getItemSync(String(id)); 
		
		res.redirect(url ? url : req.get('host')); 
		
	});
//routes(app, passport);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});