/*jslint node: true, nomen: true */
'use strict';

var path, format, fs;
path = require('./file-path');
format = require('path');

try {
	fs = require('fs');
	if (fs && fs.exists) {
		require('gun/lib/wsp');
	} else {
		fs = null;
	}
} catch (e) {
	fs = null;
}

function build(dir, depth) {
	var folder, segment;
	if (!dir.length) {
		return depth;
	}
	depth.push(segment = dir.shift());
	if (!segment) {
		return build(dir, depth);
	}
	folder = depth.join(format.sep);

	if (!fs.existsSync(folder)) {
		fs.mkdirSync(folder);
	}
	return build(dir, depth);
}

module.exports = function (string) {
	if (!string || !string.length || !fs) {
		return;
	}
	var source, route = path(string);

	build(route.path, []);

	if (route.file && !fs.existsSync(route.file)) {
		source = fs.openSync(route.file, 'w');
		fs.closeSync(source);
	}
	return route.file || format.sep + route.path.join(format.sep);
};
