/* jshint supernew:true, laxcomma: true */
module.exports = Routy;

//  core module includes
var _ = require('underscore')

  //  is the browser or node ?
  , isBrowser = false, isNode = false

  //  regexp

  , leadingTrailingSlash = /^\/+|\/+\s*$/g
  , escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g
  , optionalLeadingSlash = /^(\/?)/
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
  browser = new require('./client-side').BrowserRouty
  isBrowser = !!window;
} catch (err1) {
  try {
    //browser = require('./server-side').ServerRouty
    isNode = !!process;
  } catch (err2) {
    throw new Error('Sorry Routy can only currently run '
                    + 'in the Browser or Node.js');
  }
}

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
      console.log(arg1, arg2)
      if (_.isString(arg1.url)) return;
      respond(arg1)
    }

  }
}

//  this function starts the clientside router
Routy.listen = function (options) {
  options = settings = _.defaults((options || {}), routerDefaults);
  if (!router || _listening) return;

  router.on('load', respond);

  router.init(options);

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
  uri = uri.replace(escapeRegExp, '\\$&')
           .replace(optionalLeadingSlash, '(\\/?)')
           .replace(optionalMatch, '(?:$1)?')
           .replace(symbolMatch, function(match, optional){
            return optional ? match : '([^\/]+)';
           })
           .replace(splatMatch, '(.*?)');

  return new RegExp('^' + uri + '$');
}

//  respond to load event of router
function respond (uri, first) {
  uri = uri.replace(leadingTrailingSlash, '');

  function test (route, i, routes) {
    return handle(route, uri, i);
  }

  if (first) _.some(routes, test);  
  else _.each(routes, test);
}

//  handle the route and uri with optional array index
function handle (route, uri, i) {
  var params, match = route.uri;
  //console.log(match, uri);
  if (!match.test(uri)) return false;
  //console.log(match, uri);
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

Routy.destroy = function () {
  Routy.stop();
  routes = [];
}