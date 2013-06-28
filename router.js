exports.Router = Router;

//	core module includes
var inherits = require('inherits')
	, EventEmitter = require('events').EventEmitter
	, _ = require('underscore')


	//	is the window gobal present? save local, default to empty
	, hasWindow = !!window, win = window || {}
	, hasDoc = !!win.document, doc = win.document
	
	//	does window.location exist
	, hasLocation = !!win.location, loc = win.location || {}

	//	does window.history exist
	, hasHistory = !!win.history, hist = win.history || {}
	
	//	has hashchange event 								//	has pushstate
	, hasHashchange = 'onhashchange' in win, hasPushState = !!hist.pushState

	, docMode = doc.documentMode
	, oldIE = (/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7))

	//	regexp
	, stripSpaces = /^\s*|\s*$/g
	, stripHashSlash = /^#\/?|/
	, leadingTrailingSlash = /^\/+|\/+\s*$/g
	, trailingSlash = /\/$/
	, hashMatch = /#(.*)$/

	, routerDefaults = {
		pushState : true
		, hashChange : true
		, root : '/'
	}

	, initialURL = loc.href

;

function Router (options) {
	var interval, root, pushState, hashchange, popped;
	options = _.defaults((options || {}), routerDefaults);

	interval = options.interval || this.interval;

	root = this.root = options.root;
	pushState = this.pushState = hasPushState && options.pushState;
	hashchange = this.hashchange = !!options.hashchange;


	if (!hasHistory) return;

	//	Add Events
	if (pushState) {

		//	set timeout to wait, if in browser which fires popstate
		//	on arrival
		setTimeout(_.bind(function () {

			//	add pushstate stuff
			if (win.addEventListener) win.addEventListener('popstate', _.bind(function () { console.log('asd') }, this), false);
			else if (win.attachEvent)	win.attachEvent('onpopstate', _.bind(this.check, this));
			else this._timer = win.setInterval(_.bind(this.check, this), interval);
		}, this), 100);

	} else if (hashchange) {

		if (!hasHashchange) {
			this._timer = win.setInterval(this.check, interval);
			return;
		}

		if (win.addEventListener) win.addEventListener('hashchange', _.bind(this.check, this), false);
		else if (win.attachEvent)	win.attachEvent('onhashchange', _.bind(this.check, this));
		else this._timer = win.setInterval(_.bind(this.check, this), interval);

	} else {

		//	Do nothing
		return;
	}


	//	Handle arrival
	if (pushState) {
		var uri = getHash().replace(leadingTrailingSlash, '');
		hist.replaceState({}, document.title, root + uri + loc.search);
	} else if (hasHashchange) {

		//loc.replace
	}
}

//	return matched hash
function getHash (w) {
  var match = (w || win).location.href.match(hashMatch);
  match = match ? match[1] : '';
  return match.replace(stripHashSlash, '');
}

//	get uri if pushstate
function getFrag (root) {
	var frag;
	if (!hasPushState) return;
	frag = loc.pathname;
	root = root.replace(trailingSlash, '');
	if (frag.indexOf(root) === 0)	frag = frag.substr(root.length);
	return frag.replace(stripHashSlash, '');
}


inherits(Router, EventEmitter);

Router.prototype.interval = 50;

Router.prototype.check = function () {

};

Router.prototype.route = function () {
	var routes = this._routes || (this._routes = {});

};