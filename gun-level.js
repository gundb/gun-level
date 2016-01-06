/*jslint node: true */
'use strict';

var Gun, fs, patch, blaze, shared = {};

module.exports = Gun = require('gun/gun');
patch = require('./util/patch');
blaze = require('./util/blaze');
require('./gun.set');


console.log('Thanks for using gun-level!');
console.log('Submit any issues to: github.com/PsychoLlama/gun-level');
console.log('or ask us a question: gitter.im/amark/gun\n');



Gun.on('opt').event(function (gun, config) {

	var level, driver, path, hooks;

	level = patch.level(config);
	path = level.path;

	if (level === false) {
		return;
	}


	// allow multiple gun instances to share
	// a levelDown instance
	if (level.db) {
		driver = level.db;

	} else if (level.share && shared[path]) {
		driver = shared[path];

	} else {
		if (level.blaze) {
			blaze(path);
		}

		driver = level.up(path, level.down);

		if (level.share) {
			shared[path] = driver;
		}
	}

	hooks = patch.wire(config, driver);


	gun.opt(hooks, true);

});
