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


module.exports = {
	level: function (opt, level) {
		// Give default options where they aren't defined
		opt = opt || {};

		if (opt.level === false) {
			// return if level is disabled
			return opt;
		}

		unless(opt, 'level').set({});
		when(opt, 'level').isnt('object').set({
			share: true
		});
		when(opt.level, 'down').is('function').set({
			db: opt.level.down
		});
		if (typeof opt.level.blaze === 'string') {
			opt.level.path = opt.level.blaze;
			opt.level.blaze = true;
		}

		when(opt.level, 'share').is('undefined').set(false);

		unless(opt.level, 'db').set(null);
		unless(opt.level, 'down').set({});
		unless(opt.level, 'blaze').set(false);
		unless(opt.level, 'path').set('level/');
		unless(opt.level, 'up').set(require('levelup'));
		unless(opt.level.down, 'valueEncoding').set('json');

		return opt.level;
	},

	hooks: function (opt, level) {
		function driver(name) {
			return require('../driver/' + name)(level);
		}

		opt = opt || {};

		unless(opt, 'hooks').set({});
		unless(opt.hooks, 'get').set(driver('get'));
		unless(opt.hooks, 'put').set(driver('put'));
		unless(opt.hooks, 'key').set(driver('key'));

		return {
			hooks: opt.hooks
		};
	}
};
