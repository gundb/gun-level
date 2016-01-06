/*jslint node: true */
'use strict';
var Gun, error;
error = require('../util/error');
Gun = require('gun/gun');

module.exports = function (level) {
	return function put(graph, cb, opt) {
		var ops = [];

		Gun.is.graph(graph, function (node, soul) {
			ops.push({
				type: 'put',
				key: soul,
				value: node
			});
		});

		level.batch(ops, function (err) {
			if (err) {
				return error(cb)(err.message);
			}
			var success = {
				ok: true
			};
			cb(null, success);
		});

	};
};
