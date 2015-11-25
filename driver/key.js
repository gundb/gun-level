/*jslint node: true */
'use strict';

var error = require('../util/error');
var valid = require('../util/valid');

module.exports = function (level) {

	return function (name, soul, cb) {
		var fail = error(cb);
		if (!name) {
			return fail("No key was given to .key()");
		}
		if (!soul) {
			return fail("No soul given to .key()");
		}
		level.get(name, function (err, graph) {
			if (valid(err)) {
				return fail(err);
			}
			graph = graph || {};
			var relation = {
				'#': soul
			};
			graph[soul] = relation;
			level.put(name, graph, function (err) {
				if (valid(err)) {
					return fail(err);
				}
				cb(null, {
					ok: true
				});
			});

		});
	};

};
