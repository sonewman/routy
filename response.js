module.exports = exports = Response;

var Stream = require('stream')
;


function Response (options) {
	if (!(this instanceof Response)) 
		return new Response(options);

	Stream.call(this);

	
}

inherits(Response, Stream);


// Response.prototype.