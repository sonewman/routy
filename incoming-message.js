module.exports = exports = IncomingMessage;
//	This is a simplified browser version of the req
//	object passed in http.createServer

var Stream = require('stream')

;

//	IncomingMessage needs to be a Readable stream

function IncomingMessage () {
	if (!(this instanceof IncomingMessage)) 
		return new IncomingMessage(options);

	Stream.call(this);
}

inherits(IncomingMessage, Stream);