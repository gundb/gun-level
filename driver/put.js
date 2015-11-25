/*jslint node: true */
'use strict';
var valid = require('../util/valid');
var error = require('../util/error');
var Gun = require('gun/gun');


module.exports = function (level) {
	return function (graph, cb, opt) {
		var saved = 0,
			pending = 0;

		Gun.is.graph(graph, function (node, soul) {
			pending += 1;
			level.put(soul, node, function (err) {
				if (valid(err)) {
					return error(cb)(err);
				}
				saved += 1;
				if (pending === saved) {
					cb(null, {
						ok: true
					});
				}
			});
		});
	};
};
