console.log('spec');
var test = require('tape')
	, sinon = require('sinon')
	, routy = require('../../index')
	, browserRouty = routy.router
;

// test('Routy()', function (t) {
// 	t.test('passing a string and a callback', function (t) {
// 		var cb = sinon.spy()
// 			, http = Object.create(httpMock);

// 		routy('/test', cb);


// 		t.assert(cb.called, 'callback should be called');
// 		t.end();
// 	});

// 	t.end();

// });


test('Routy.moveTo()', function (t) {
	routy.listen();
	sinon.spy(browserRouty, 'moveTo');
	routy.moveTo();
	t.assert(
		browserRouty.moveTo.called
		, 'BrowserRouty.moveTo to have been called'
	)


	t.end();

});