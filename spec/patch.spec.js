/*globals describe, it, pending, expect, beforeEach, afterAll, jasmine */
/*jslint node: true */
'use strict';

var patch = require('../util/patch');

describe('The level-patcher', function () {
	var warn;

	it('should be able to handle no input', function () {
		expect(patch.level()).toEqual(jasmine.any(Object));
	});

	it('should stop and return the options ' +
		'object if "level" is false',
		function () {
			var opt = patch.level({
				level: false
			});
			expect(opt).toEqual(false);
		});

	it('should set the default path to "level/"', function () {
		var level = patch.level({
			level: {}
		});
		expect(level.path).toBe('level/');
	});

	it("should use path when it's been defined", function () {
		var level = patch.level({
			level: {
				path: 'or not toBe'
			}
		});
		expect(level.path).toBe('or not toBe');
	});


	warn = console.warn;

	it('should warn that "folder" is deprecated', function () {
		var warned = false;
		console.warn = function () {
			warned = true;
		};
		patch.level({
			level: {
				folder: 'old implementation'
			}
		});
		expect(warned).toBe(true);
	});

	it('should ensure that "folder" is undefined', function () {
		var level = patch.level({
			level: {
				folder: 'old implementation'
			}
		});
		expect(level.folder).toBe(undefined);
	});

	console.warn = warn;


	it('should default blaze to false when blaze is not set', function () {
		var level = patch.level({
			level: {
				path: 'prevent blaze default setting'
			}
		});
		expect(level.blaze).toBe(false);
	});

	it('should take a "blaze" option as a boolean', function () {
		var level = patch.level({
			level: {
				blaze: true
			}
		});
		expect(level.blaze).toBe(true);
	});

	it('should take a "blaze" option as a string, forwarding to "path"', function () {
		var level = patch.level({
			level: {
				blaze: 'the folder in question'
			}
		});
		expect(level.path).toBe('the folder in question');
	});

	it('should turn "blaze" strings into booleans', function () {
		var level = patch.level({
			level: {
				blaze: 'this string is sent to the "path" option'
			}
		});
		expect(level.blaze).toBe(true);
	});

	it('should take a "db" option', function () {
		var level = patch.level({
			level: {
				db: {
					test: true
				}
			}
		});
		expect(level.db.test).toBe(true);
	});

	it('should default "db" to null', function () {
		var level = patch.level();
		expect(level.db).toBe(null);
	});

	it('should take an "up" option', function () {
		var level = patch.level({
			level: {
				up: function () {
					return true;
				}
			}
		});
		expect(level.up()).toBe(true);
	});

	it('should default to levelUP', function () {
		var level = patch.level();
		expect(level.up).toEqual(jasmine.any(Function));
	});

	it('should take a "down" option', function () {
		var level = patch.level({
			level: {
				down: function () {
					return true;
				}
			}
		});
		expect(level.down.db()).toBe(true);
	});

	it('should coerce the "down" option into an object under the "db" property', function () {
		var level = patch.level({
			level: {
				down: function () {
					return true;
				}
			}
		});
		expect(level.down.db).toEqual(jasmine.any(Function));
	});

	it('should allow settings within the "down" object', function () {
		var level = patch.level({
			level: {
				down: {
					valueEncoding: 'potato'
				}
			}
		});
		expect(level.down.valueEncoding).toBe('potato');
	});

	it('should use json as the default value encoding', function () {
		var level = patch.level();
		expect(level.down.valueEncoding).toBe('json');
	});

	it('should accept a "share" option', function () {
		var level = patch.level({
			level: {
				share: true
			}
		});
		expect(level.share).toBe(true);
	});

	it('should default to sharing when blaze is set', function () {
		var level = patch.level({
			level: {
				blaze: true
			}
		});
		expect(level.share).toBe(true);
	});
});




describe('The hook-patcher', function () {

	it('should be able to handle no input', function () {
		var opt = patch.hooks();
		expect(opt).toEqual(jasmine.any(Object));
	});

	it('should return the hooks inside an otherwise empty object', function () {
		var key, opt = patch.hooks();
		for (key in opt) {
			if (opt.hasOwnProperty(key)) {
				expect(key).toBe('hooks');
				expect(opt[key]).toEqual(jasmine.any(Object));
			}
		}
	});

	it('should not overwrite existing hooks', function () {
		var opt = patch.hooks({
			hooks: {
				get: true,
				put: true,
				key: true
			}
		});
		expect(opt.hooks.get).toBe(true);
		expect(opt.hooks.put).toBe(true);
		expect(opt.hooks.key).toBe(true);
	});

	it('should only overwrite undefined hooks', function () {
		var opt = patch.hooks({
			hooks: {
				get: true,
				put: true
			}
		});
		expect(opt.hooks.get).toBe(true);
		expect(opt.hooks.put).toBe(true);
		expect(opt.hooks.key).toEqual(jasmine.any(Function));
	});

	it('should patch every undefined hook', function () {
		var opt = patch.hooks({
			hooks: {}
		});
		expect(opt.hooks.get).toEqual(jasmine.any(Function));
		expect(opt.hooks.put).toEqual(jasmine.any(Function));
		expect(opt.hooks.key).toEqual(jasmine.any(Function));
	});
});
