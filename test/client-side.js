var port = 8000
	, path = require('path')
	, fs = require('fs')
	, mimetype = require('mimetype')
	, http = require('http')
	, start, end, ext = /\.js$/
	, files = [], html = ''
	, _slice = Array.prototype.slice
	, args, all = true
	;

args = process.argv.slice(2);

if (args.length > 0) {
	all = args.some(function(file, i) {
		if (i === 0 && typeof file === 'number') {
			port = file;
			return false;
		}
		if (file === 'all') return true;
		files.push(path.resolve(process.cwd(), file));
		return false;
	});
}

start = '<!doctype html><html><head><style>' + 
	'body { font-family: monospace;white-space: pre; }' +
	'</style></head><body><script>' +
	'if (typeof console === \'undefined\') {' +
	'var log = console.log;}' +
	//'if (typeof console === \'undefined\') { console = {};' +
	'console.log = function (msg, out) {' +
	'if (out) { return log(msg); }' +
	'var el = document.createElement(\'div\');' +
	'el.innerHTML = msg; ' +
	'document.body.appendChild(el);};' +
	//'}' + 
	'</script>';
end = '</body></html>';

html += start;
if (all) files = getAll();
html += files.map(script).join('\n');
html += end;

http.createServer(function (req, res) {
	var file;
	
	if (ext.test(req.url)) {
		res.writeHeader(200, {
			'Content-Type' : mimetype.lookup(req.url)
		});

		file = fs.createReadStream(__dirname + req.url);
		file.pipe(res);
		return;
	}
	res.writeHeader(200, { 'Content-Type' : 'text/html' });
	res.end(html);
}).listen(port);

console.log(__dirname)
console.log('Test server running on port ' + port);

function script (file) {
	file = ext.test(file) ? file : file += '.js';
	return '<script src="/bundles/' + file + '"></script>';
}

function getAll () {
	return fs.readdirSync(__dirname + '/bundles') || [];
}

function getFile () {

}