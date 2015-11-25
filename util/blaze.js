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



module.exports = function (path) {
	var depth = [];
	if (!fs) {
		return;
	}

	function recurse(path) {
		if (!path) {
			return 'done!';
		}
		path = path.split('/').filter(function (dir) {
			return !!dir;
		});
		depth.push(path.shift());
		var folder = depth.join('/');
		if (fs.existsSync(folder)) {
			return recurse(path && path.join('/'));
		} else {
			fs.mkdirSync(folder);
			return recurse(path && path.join('/'));
		}
	}

	return recurse(path);
};
