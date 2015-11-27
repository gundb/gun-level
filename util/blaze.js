/*jslint node: true, nomen: true */
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

function build(root, path, depth) {
	if (!path.length) {
		return depth;
	}
	depth.push(path.shift());
	var folder = root.concat(depth).join('/');
	if (!fs.existsSync(folder)) {
		fs.mkdirSync(folder);
	}
	return build(root, path, depth);
}

module.exports = function (string) {
	var path, file, root;
	if (!string || !string.length || !fs) {
		return;
	}
	path = string.split('/').filter(function (dir) {
		return !!dir;
	});

	if (string.charAt(0) === '/') {
		root = [''];
	} else {
		root = __dirname.split('/').filter(function (dir) {
			return !!dir;
		});
		root.unshift('');
	}
	file = isFile(root.concat(path));
	if (file) {
		path.pop();
	}
	path = build(root, path, []);
	if (file && !fs.existsSync(file)) {
		fs.closeSync(fs.openSync(file, 'w'));
	}
	return file || path.join('/');
};
