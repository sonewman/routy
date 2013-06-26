//	Routy is the returned function
module.exports = exports = Routy;

//	expose the class for testing and other purposes
exports.Router = Router;

//	core module includes
var inherits = require('inherits')
	, EventEmitter = require('events').EventEmitter
	, _ = require('underscore')


	//	is the window gobal present? save local, default to empty
	, hasWindow = !!window, win = window || {}
	
	//	does window.location exist
	, hasLocation = !!win.location, loc = win.location

	//	does window.history exist
	, hasHistory = !!win.history, hist = win.history || {}
	
	//	has hashchange event 								//	has pushstate
	, hasHashchange = 'onhashchange' in win, hasPushState = !!hist.pushState;

	//	regexp
	, stripSpaces = /^\s*|\s*$/g
	, stripHashSlash = /^#\/?|/
	, leadingTrailingSlash = /^\/+|\/+$/g;


	, routerDefaults = {
		pushState : true
		, hashChange : true
	}

	//	base router uses in all routes
	, router

;

function Routy () {
	//	create router if it does not exist already
	if (!router) {
		router = new Router();
		Routy.router = router;
	}



}

//	set pushstate status
// Routy.pushState = function (value) {
// 	if (value === true) {
// 		router
// 	}
// };


function getHash () {
  var match = win.location.href.match(/#(.*)$/);
  return match ? match[1] : '';
}


function Router (options) {
	options = this.settings = _.defaults((options || {}), routerDefaults);


	//	do stuff
	if (hasPushState && options.pushState) {
		//hist.
	}
}

inherits(Router, EventEmitter);

Router.prototype.route = function () {
	var routes = this._routes || (this._routes = {});

};



