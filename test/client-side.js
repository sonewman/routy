var start, end, http = require('http'), ext = /\.js$/
	, files = [], port = 8000, path = require('path'), html = '', fs;

var all = process.argv.slice(2).some(function(file, i) {
	if (i === 0 && typeof file === 'number') {
		port = file;
		return false;
	}
	files.push(path.resolve(process.cwd(), file));
	return false;
});

start = '<!doctype html><html><head><style>' + 
	'body { font-family: monospace;white-space: pre; }' +
	'</style></head><body><script>' +
	'if (typeof console === \'undefined\') console = {};' +
	'console.log = function (msg) {' +
	'var txt = document.createTextNode(msg);' +
	'document.body.appendChild(txt);};</script>';
end = '</body></html>';

html += start;

if (all) {
	getAll().forEach(buildScripts);
} else {
	files.forEach(buildScripts);
}
html += end;

http.createServer(function (req, res) {
	res.writeHeader(500, { 'Content-Type' : 'text/html' });
	res.end(html);
}).listen(port);

function script (file) {
	file = ext.test(file) ? file : file += '.js';
	return '<script src="' + file + '"></script>';
}

function buildScripts (html, str) {
	html += script(str);
}

function getAll () {
	return fs.readdirSync('./') || [];
}