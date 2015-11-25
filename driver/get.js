/*jslint node: true */
'use strict';

var Gun = require('gun/gun');
var error = require('../util/error');
var valid = require('../util/valid');

module.exports = function (level) {
	function getSoul(soul, cb, opt, count) {

		level.get(soul, function (err, node) {
			var graph = {},
				soul = Gun.is.soul.on(node);

			if (valid(err)) {
				return error(cb)(err);
			}

			graph[soul] = node;
			cb(null, graph);

			graph[soul] = Gun.union.pseudo(soul);
			cb(null, graph);

			count.found += 1;
			if (count.requested === count.found) {
				// terminate
				cb(null, {});
			}
		});
	}



	function getKey(key, cb, opt, count) {

		level.get(key, function (err, souls) {

			if (!souls) {
				cb(null, null);
			}

			// map over each soul in the graph
			Gun.obj.map(souls, function (rel, soul) {
				count.requested += 1;

				// get that soul
				getSoul(soul, cb, opt, count);
			});
		});
	}

	return function get(key, cb, opt) {
		var soul, err;

		if (!key) {
			err = "No data was given to .get()";
			return error(cb)(err);
		}

		soul = Gun.is.soul(key);
		if (soul) {
			getSoul(soul, cb, opt, {
				requested: 1,
				found: 0
			});
		} else {
			// getKey depends on getSouls
			getKey(key, cb, opt, {
				requested: 0,
				found: 0
			});
		}

	};
};
