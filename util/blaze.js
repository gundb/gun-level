/*jslint node: true */
'use strict';

var fs;

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

function isFile(path) {
	var file = path[path.length - 1];
	if (file.match(/\w+\.\w+$/)) {
		return path.join('/');
	} else {
		return false;
	}
}

function build(path, depth) {
	if (!path.length) {
		return depth;
	}
	depth.push(path.shift());
	var folder = depth.join('/');
	if (!fs.existsSync(folder)) {
		fs.mkdirSync(folder);
	}
	return build(path, depth);
}

module.exports = function (path) {
	if (!path || !path.length || !fs) {
		return;
	}
	path = path.split('/').filter(function (dir) {
		return !!dir;
	});
	var file = isFile(path);
	if (file) {
		path.pop();
	}

	path = build(path, []);
	if (file && !fs.existsSync(file)) {
		fs.closeSync(fs.openSync(file, 'w'));
	}
	return file || path.join('/');
};
