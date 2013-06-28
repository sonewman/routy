//	Routy is the returned function
module.exports = exports = Routy;

//	core module includes
var inherits = require('inherits')
	, EventEmitter = require('events').EventEmitter
	, _ = require('underscore')

	//	base router uses in all routes
	, Router = exports.Router = require('./router').Router
	, router

;

function Routy () {
	//	create router if it does not exist already
	if (!router) {
		router = new Router();
		Routy.router = router;
	}
	

}

//	API

//	set pushstate status
// Routy.pushState = function (value) {
// 	if (value === true) {
// 		router
// 	}
// };