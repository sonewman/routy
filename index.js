/* jshint supernew:true, laxcomma: true */
module.exports = Routy;

//  core module includes
var _ = require('underscore')

  , BrowserRouty = require('./client-side').BrowserRouty
  // , ServerRouty = require('./server-side').ServerRouty

  //  is the browser or node ?
  , isBrowser = false, isNode = false

  //  regexp

  , leadingTrailingSlash = /^\/+|\/+\s*$/g
  , escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g
  , optionalMatch = /\((.*?)\)/g
  , symbolMatch = /(\(\?)?:\w+/g
  , splatMatch = /\*[^\?|\/]*/g

  , routerDefaults = {
    root : '/'
    , autoCheck : true
  }

  , settings = {}
  , routes = []
  , _listening = false

  , router
;

//  determine environment browser or node
try {
  isBrowser = !!window;
} catch (err1) {
  try {
    isNode = !!process;
  } catch (err2) {
    throw new Error('Sorry Routy can only currently run '
                    + 'in the Browser or Node.js');
  }
}

//  if browser create browerRouty
if (isBrowser) router = new BrowserRouty;
//  else if (isNode) rouer = new NodeRouty;

//  router high-level abstraction

function Routy (arg1, arg2, arg3) {
  var total, options;
  total = arguments.length;

  if (1 == total) {
    options = arg1;
  } else if (1 < total) {

    if (_.isString(arg1) && _.isFunction(arg2)) {
      return Routy.route(arg1, arg2,(arg3 || null));
    } else if (_.isObject(arg1) && _.isObject(arg2)) {
      //  do node stuff
    }

  }
}

//  this function starts the clientside router
Routy.listen = function (options) {
  options = settings = _.defaults((options || {}), routerDefaults);
  if (!router || _listening) return;

  router.on('load', respond);

  if (isBrowser) router.init(options);
  // else if (isNode) router = new ServerRouty

  _listening = true;
};

//  add new route
Routy.route = function (uri, cb, ctx, once) {
  var route, current = false;
  if (!_.isRegExp(uri)) uri = routeToRegExp(uri);
  route = { 
    uri : uri
    , cb : cb
    , ctx : ctx
    , once : once || false 
  };
  if (settings.autoCheck) current = handle(route, router.current());
  if (!once || (once && !current)) routes.push(route);
};

//  this function was borrowed from backbone
function routeToRegExp (uri) {
  uri = uri.replace(leadingTrailingSlash, '')
           .replace(escapeRegExp, '\\$&')
           .replace(optionalMatch, '(?:$1)?')
           .replace(symbolMatch, function(match, optional){
            return optional ? match : '([^\/]+)';
           })
           .replace(splatMatch, '(.*?)');
           console.log(uri)
  return new RegExp('^' + uri + '$');
}

//  respond to load event of router
function respond (uri, first) {
  console.log(uri)
  function test (route, i, routes) {
    handle(route, uri, i);
  }

  if (first) _.some(routes, test);  
  else _.each(routes, test);
}

//  handle the route and uri with optional array index
function handle (route, uri, i) {
  var params, match = route.uri;
  uri = uri.replace(leadingTrailingSlash, '');
  if (!match.test(uri)) return false;
  params = getParams(match, uri);
  route.cb.call(route.ctx, params);
  if (route.once && i !== void 0) routes.splice(i, 1);
  return true;
}

//  get parameters when passed regexp and uri
function getParams (routeRegExp, uri) {
  var params = routeRegExp.exec(uri).slice(1);
  return _.map(params, function(param) {
    return param ? decodeURIComponent(param) : null;
  });
}

//  expose routes object
Routy.routes = routes;


//Routy.skip

//  proxy routers move to
Routy.moveTo = function (uri, options) {
  if (_listening)  router.moveTo(uri, options);
};

//  Stop router
Routy.stop = function () {
  if (!_listening) return;
  router.stop();
  _listening = false;
};

//  proxy router events //

Routy.on = function (name, cb) {
  if (router) router.on(name, cb);
};

Routy.off = function (name, cb) {
  if (router) router.off(name, cb);
};

Routy.emit = function (name) {
  if (router) router.emit.apply(router, arguments);
};