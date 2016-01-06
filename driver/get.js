/*jslint node: true, nomen: true */
'use strict';

var Gun = require('gun/gun');
var error = require('../util/error');
var valid = require('../util/valid');

module.exports = function (level) {

	return function get(soul, cb, opt) {
		level.get(soul, function (err, node) {
			var rel;

			if (valid(err)) {
				return error(cb)(err);
			}

			if (!node) {
				// then terminate
				return cb(null, null);
			}

			// Send the object object
			cb(null, node);

			// terminate the object
			rel = Gun.is.node.soul.ify({
				_: node._
			}, Gun.is.node.soul(node));

			cb(null, rel);

			// end the stream
			cb(null, {});
		});

	};
};
