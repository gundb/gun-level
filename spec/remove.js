/*jslint node: true*/
'use strict';
var fs = require('fs');

function remove(path) {
	if (!path) {
		return;
	}
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function (file, index) {
			var curPath = path.replace(/\/*$/, '/') + file;
			if (fs.lstatSync(curPath).isDirectory()) {
				remove(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		});
		if (fs.existsSync(path)) {
			fs.rmdirSync(path);
		}
	}
	return null;
}
module.exports = remove;
