/*jslint node: true, nomen: true */
'use strict';
var path = require('path');

function hasFile(dir) {
	var file = dir[dir.length - 1];
	if (file.match(/\w+\.\w+$/)) {
		return dir.join(path.sep);
	} else {
		return false;
	}
}

module.exports = function (string) {
	var root, dir, file;
	if (!string) {
		return;
	}

	root = path.resolve(string);
	dir = root.split(path.sep);

	file = hasFile(dir);

	if (file) {
		dir.pop();
	}
	return {
		file: file,
		path: dir
	};
};
