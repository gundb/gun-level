/*globals describe, it, pending, expect, beforeEach, afterAll, jasmine */
/*jslint node: true */
'use strict';

var valid = require('../util/valid');
var error = require('../util/error');

describe('The error module', function () {

	it('should be a function', function () {
		expect(error).toEqual(jasmine.any(Function));
	});

	it('should return a function', function () {
		expect(error(function () {})).toEqual(jasmine.any(Function));
	});

	it('should invoke the callback with an object', function () {
		var obj;

		function cb(err) {
			obj = err;
		}
		error(cb)('msg');
		expect(obj).toEqual(jasmine.any(Object));
	});

	it('should invoke the callback with an ' +
		'"err" property, set as the error message',
		function () {
			var obj;

			function cb(err) {
				obj = err;
			}
			error(cb)('msg');
			expect(obj.err).toBe('msg');
		});
});

describe('The error validation module', function () {

	it('should disregard invalid error types', function () {
		expect(valid()).toBe(false);
		expect(valid({})).toBe(false);
	});

	it('should disregard "not found" errors', function () {
		var isValid = valid({
			message: 'Key not found in database'
		});
		expect(isValid).toBe(false);
	});

	it("should call anything without discrimination valid", function () {
		var isValid = valid({
			message: 'everything is on fire'
		});
		expect(isValid).toBe(true);
	});
});
