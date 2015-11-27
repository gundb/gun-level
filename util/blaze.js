/*jslint node: true, nomen: true */
'use strict';

var fs,
	filePath = require('./file-path');

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
	var resource, path, file, root;
	if (!string || !string.length || !fs) {
		return;
	}
	resource = filePath(__dirname, string);
	root = resource.root;
	path = resource.path;
	file = resource.file;

	path = build(root, path, []);
	if (file && !fs.existsSync(file)) {
		fs.closeSync(fs.openSync(file, 'w'));
	}
	return file || path.join('/');
};
