/*jslint node: true */
'use strict';

function when(obj, prop) {
	return {
		is: function (type) {
			return {
				set: function (val) {
					if (typeof obj[prop] === type) {
						obj[prop] = val;
					}
				}
			};
		},
		isnt: function (type) {
			return {
				set: function (val) {
					if (typeof obj[prop] !== type) {
						obj[prop] = val;
					}
				}
			};
		}
	};
}

function unless(obj, prop) {
	return {
		set: function (val) {
			return (obj[prop] = obj[prop] || val);
		}
	};
}

// patch single-condition options
function patch(opt) {
	unless(opt.level, 'db').set(null);
	unless(opt.level, 'down').set({});
	unless(opt.level, 'blaze').set(false);
	unless(opt.level, 'path').set('level/');
	unless(opt.level, 'up').set(require('levelup'));
	unless(opt.level.down, 'valueEncoding').set('json');
	return opt;
}

// handle deprecated options
function findDeprecated(opt) {
	if (typeof opt.level.folder !== 'undefined') {
		opt.level.path = opt.level.folder;
		opt.level.folder = undefined;
		console.warn('\tThe gun-level "folder"' +
			'option has been deprecated.');
		console.warn('\tUse "path" or "blaze" instead.\n');
	}
	return opt;
}

module.exports = {
	level: function (opt, level) {
		// Give default options where they aren't defined
		opt = opt || {};

		if (opt.level === false) {
			// return if level is disabled
			return opt.level;
		}

		unless(opt, 'level').set({});

		// level wasn't defined. We're flying blind.
		when(opt, 'level').isnt('object').set({
			share: true
		});

		// the user wants to use a db module
		when(opt.level, 'down').is('function').set({
			db: opt.level.down
		});

		// the user wants to blaze a path
		if (typeof opt.level.blaze === 'string') {
			opt.level.path = opt.level.blaze;
			opt.level.blaze = true;
		}

		// define default share settings
		var sharing = when(opt.level, 'share').is('undefined').set;
		if (opt.level.blaze === true) {
			sharing(true);
		}
		sharing(false);

		// handle deprecated options
		findDeprecated(opt);

		// set the minor defaults
		return patch(opt).level;
	},

	wire: function (opt, level) {
		// grab the corresponding method name
		function driver(name) {
			return require('../driver/' + name)(level);
		}

		opt = opt || {};

		unless(opt, 'wire').set({});
		unless(opt.wire, 'get').set(driver('get'));
		unless(opt.wire, 'put').set(driver('put'));

		return {
			wire: opt.wire
		};
	}
};
