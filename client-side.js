/* jshint laxcomma: true, laxbreak: true */
exports.BrowserRouty = BrowserRouty;

//  core module includes
var inherits = require('inherits')
  , EventEmitter = require('events').EventEmitter
  , _ = require('underscore')

  , win = window || {}, doc = win.document, loc = win.location || {}
  , hasHistory = !!win.history, hist = win.history || {}
  , hasHashChange = 'onhashchange' in win, hasPushState = !!hist.pushState

  , docMode = doc.documentMode
  , oldIE = (/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7))

  //  regexp
  , stripSpaces = /^\s*|\s*$/g
  , stripHashSlash = /^#\/?|/
  , leadingTrailingSlash = /^\/+|\/+\s*$/g
  , leadingSlash = /^\//
  , trailingSlash = /\/$/
  , hashMatch = /#\!?(.*)$/
  , wholeHash = /#.*$/
  , escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g
  , pathEnd = /[^\/]$/

  , BrowserRoutyDefaults = {
    //  router will use pushstate if possible
    pushState : true
    //  router will use hashChange is pushstate not available
    , hashChange : true
    //  if router uses hash, it will use hashbang
    , useHashBang : true
    //  if router uses hash it will anchorable hash
    , anchoredHash : true
    //  filter applied to links, to determine whether router
    //  should take over
    , filterLinks : /^[\#|\/][^\.]*(?!(\.\w+))$/
  }
;


//  Main class constructor
function BrowserRouty (options, init) {
  EventEmitter.call(this);
  if (init) this.init(options);
}

//  inherit Event mitter functionality
inherits(BrowserRouty, EventEmitter);

//  initialise settings and loading current path
BrowserRouty.prototype.init = function (options) {
  var interval, root, pushState, hashChange, filter, uri, atRoot;

  options = _.defaults((options || {}), BrowserRoutyDefaults);
  interval = options.interval;
  root = this.root = options.root;
  atRoot = loc.pathname.replace(pathEnd, '$&/') === root;
  pushState = this.pushState = hasPushState && options.pushState;
  hashChange = this.hashChange = !!options.hashChange;
  this.hashBang = !!options.useHashBang;

  filter = this.filterLinks = options.filterLinks;
  if (filter !== false) this.hijackLinks(filter);

  //  Add Events

  //  if pushState is available and we would like to
  //  use pushState
  if (pushState) {
    //  set timeout to wait, if in browser which
    //  fires popstate on arrival
    setTimeout(_.bind(function () {
      //  add popState listener
      addEvent(win, 'popstate', _.bind(this.load, this, null));
    }, this), 200);

  //  if we would like to use hashchange fallback or default
  } else if (hashChange) {
    //  is event supported, if not use timer
    if (!hasHashChange) this._timer = win.setInterval(_.bind(this.load, this), interval);
    else addEvent(win, 'hashchange', _.bind(this.load, this, null));

  } else {
    //  Do nothing
    return;
  }

  //  Handle arrival
  if (pushState && atRoot) {

    uri = getHash().replace(leadingTrailingSlash, '');
    hist.replaceState({}, document.title, root + uri + loc.search);

  } else if (hasHashChange && !atRoot) {

    uri = getUri(root);
    if (uri === '/') uri = '';
    loc.replace(root + loc.search + '#' + uri);

  }

  this.load(null);
};



//  return matched hash
function getHash (uri, w) {
  var match = (uri ? uri : (w || win).location.href).match(hashMatch);
  match = match ? match[1] : '';
  return match.replace(stripHashSlash, '');
}

//  update the current hash
function updateHash (uri, replace, location) {
  var href;
  if (uri === void 0) return;
  location = location || loc;
  if (!replace) {
    location.hash = uri;
    return;
  }
  location.replace(location.href.replace(wholeHash, '') + uri);
}

//  get uri if pushState
function getUri (root, uri) {
  if (!hasPushState) return;
  uri = uri || loc.pathname;
  root = root.replace(trailingSlash, '');
  if (uri.indexOf(root) !== 0) uri = uri.substr(root.length);
  return uri.replace(stripHashSlash, '');
}

function createIFrame () { /* TODO for IE < 7 */ }

//  get current uri / hash
BrowserRouty.prototype.current = function () {
  return this.pushState ? getUri(this.root) : getHash(loc.href);
};

//  handler for events
BrowserRouty.prototype.load = function (uri) {
  this.emit('load', (uri || this.current()));
};


BrowserRouty.prototype.moveTo = function (uri, options) {
  var silent = false, replace = false;
  options = options || {};

  if (options === true) {
    silent = true; 
  } else if (_.isObject(options)) {
    silent = options.silent;
    replace = options.replace;
  }

  if (this.pushState) {
    uri = uri.replace(stripHashSlash, '');
    if (uri[0] !== '/') uri = '/' + uri;
    hist[(!replace ? 'pushState' : 'replaceState')](options.data || {}, doc.title, uri);
    this.load(uri);
  } else if (this.hashChange) {

    //  TODO IFrame handling for IE < 7
    if (this.hashBang) uri = '!' + uri;
    else if (this.anchoredHash) uri = uri.replace(leadingSlash, '');
    uri = '#' + uri;
    updateHash(uri, replace);

  } else {
    loc.assign(uri);
  }
};

BrowserRouty.prototype.linkHandler = function (matcher) {
  var _this = this;

  return function (e) {
    var href, el;

    if (!e) e = window.event;
    el = e.target;

    if ('A' !== el.tagName) return;

    href = el.getAttribute('href');

    if (!matcher.test(href)
      || (!_this.pushState && _this.hashChange && ('#' === href[0]))) {
      return;
    }

    if (e.preventDefault) e.preventDefault(); 
    else e.returnValue = false;

    _this.moveTo(href);
  };
};

BrowserRouty.prototype.hijackLinks = function (basedOn) {
  if (!(_.isRegExp(basedOn))) {
    basedOn = new RegExp(basedOn.replace(escapeRegExp, '\\$&'));
  }
  this._linkFilter = basedOn;
  this_hijackedLinks = true;
  this._currentLinkHandler = this.linkHandler(basedOn);
  addEvent(doc, 'click', this._currentLinkHandler);
};

BrowserRouty.prototype.resetLinks = function () {
  if (!this._hijackedLinks) return;
  removeEvent(doc, 'click', this._currentLinkHandler);
};


BrowserRouty.prototype.stop = function () {
  //  Add Events
  if (!this._started) return;

  if (this.pushState) {

    removeEvent(win, 'popstate', _.bind(this.load, this, null));

  } else if (this.hashchange) {

    if (!hasHashChange) win.clearInterval(this._timer);
    else removeEvent(win, 'hashchange', _.bind(this.load, this, null));
  }
};

//  Handle cross browser event listeners

function addEvent (el, evt, cb) {
  if (el.addEventListener) el.addEventListener(evt, cb, false);
  else if (el.attachEvent) el.attachEvent('on' + evt, cb); 
}

function removeEvent (el, evt, cb) {
  if (el.removeEventListener) el.removeEventListener(evt, cb, false);
  else if (el.detachEvent) el.detachEvent('on' + evt, cb); 
}