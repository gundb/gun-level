/*jslint node: true */
'use strict';
module.exports = function (cb) {
	return function (msg) {
		cb({
			err: msg
		}, false);
	};
};
