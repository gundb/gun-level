/*jslint node: true, nomen: true */
'use strict';

function isFile(path) {
	var file = path[path.length - 1];
	if (file.match(/\w+\.\w+$/)) {
		return path.join('/');
	} else {
		return false;
	}
}

function truthy(dir) {
	return !!dir;
}


module.exports = function (root, string) {
	if (!string || !string.length) {
		return;
	}
	if (string.charAt(0) === '/' && string.match(root)) {
		string = string.replace(root, '');
	} else if (string.charAt(0) === '/') {
		root = '';
	}
	root = root.split('/').filter(truthy);
	root.unshift('');

	var path = string.split('/').filter(truthy),
		file = isFile(root.concat(path));

	if (file) {
		path.pop();
	}
	return {
		file: file,
		root: root,
		path: path
	};
};
