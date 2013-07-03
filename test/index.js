var test = require('tape')
	, sinon = require('sinon')
	,	routy = require('routy')

	//	mock http
	, httpMock = {
		req : { url : '/', method : 'GET' }
		, res : {
			end : function () { return true; }
			, write : function () { return true; }
			, writeHeader : function () { return true }
		}
		, _fn : function () {}
		, createServer : function (fn) { this._fn = fn; return this; }
		, listen : function (no) { return this; }
		, visit : function (url) {
			this.req.url = url;
			this._fn(this.req, this.res);
		}
		, reset : function () {
			this._fn = function () {};
			this.req.url = '/';
		}
	}
;

var stream = require('stream').Readable;

console.log(stream)

// test('Routy()', function (t) {

// 	t.test('passing a string and a callback', function (t) {
// 		var cb = sinon.spy()
// 			, http = Object.create(httpMock);

// 		routy('/test', cb);

// 		http.createServer(routy).listen(5000);

// 		http.visit('/test');

// 		t.assert(cb.called, 'callback should be called');
// 		t.end();
// 	});

// 	t.end();

// });