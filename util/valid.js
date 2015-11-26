/*jslint node: true */
'use strict';

module.exports = function (err) {

	var noData = 'Key not found in database';

	if (!err || !err.message) {
		return false;
	}
	if (err.message.match(noData)) {
		return false;
	}
	return true;
};
