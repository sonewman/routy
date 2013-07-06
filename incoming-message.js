module.exports = exports = IncomingMessage;
//	This is a simplified browser version of the req
//	object passed in http.createServer

var Stream = require('stream')
	, win = window, doc = document, loc = location
	, nav = navigator
;

//	IncomingMessage needs to be a Readable stream

function IncomingMessage (options) {
	if (!(this instanceof IncomingMessage)) 
		return new IncomingMessage(options);

	Stream.call(this);

	this.url = options.url;
	//	set node like headers
	this.headers = getHeader();
}

inherits(IncomingMessage, Stream);


function getHeader () {
	return {
		'user-agent' : nav.userAgent
		, host : loc.host
	}
}