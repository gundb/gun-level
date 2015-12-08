/*globals describe, it, pending, expect, beforeEach, afterAll */
/*jslint node: true */
'use strict';

var Gun, remove, format, fs, testFolder, testedDefault = false;
testFolder = require('./folder');
Gun = require('../gun-level');
remove = require('./remove');
format = require('path');
fs = require('fs');


function setup(path) {
	var depth, dest;
	if (path !== undefined) {
		depth = path.split('/').join(format.sep);
		dest = format.join(testFolder, depth);
	}

	return new Gun({
		level: {
			blaze: (path || path === '') ? dest : '',
			share: true
		}
	});
}


function exists(path) {
	return fs.existsSync(testFolder + path);
}

afterAll(function () {
	remove(testFolder);
	if (testedDefault) {
		remove('level');
	}
});



var spec = require('gun-module-spec');



describe("gun-level", function () {
	var gun;

	// Fresh instance each test
	beforeEach(function (done) {
		gun = setup('').get('test').set();
		done();
	});


	it('should hold up to rapid-fire put requests', function (done) {
		var num;
		for (num = 1; num <= 10; num += 1) {
			gun.put({
				name: 'test ' + num
			});
		}
		gun.path('name').val(function (val) {
			expect(val).toBe('test 10');
			done();
		});
	});

	it('should allow you to point two instances to the same path', function () {
		expect(setup).not.toThrow();
		expect(setup).not.toThrow();
		expect(setup).not.toThrow();
		expect(setup).not.toThrow();
		expect(setup).not.toThrow();
	});



	describe('path option', function () {

		it('should let you point to any path', function () {
			var path = 'tomato-potato';
			setup(path).get('thing').set();
			expect(exists(path)).toBe(true);
		});

		it('should allow paths at any depth', function () {
			var path = 'really/deep/path/';
			setup(path);
			expect(exists(path)).toBe(true);
		});

		it("shouldn't break with weird path names", function () {
			var path = 'ǄǅǆǇǈǉǊǋǌǍǎǏǐǑǒǓǔǕǖǗǘǙǚǛǜǝǞǟ/';
			setup(path);
			expect(exists(path)).toBe(true);
		});

		if (!fs.existsSync('level')) {
			it("should be optional", function () {
				setup();
				expect(fs.existsSync('level')).toBe(true);
			});
			testedDefault = true;
		}

	});



	describe('put method', function () {

		beforeEach(function (done) {
			gun.put({
				key: 'val'
			}, done);
		});

		it("should write successfully", function (done) {
			gun.path('key').val(function (val) {
				expect(val).toBe('val');
				done();
			});
		});

		it("should save data without returning an error", function (done) {
			gun.put({
				key: 'value'
			}, function (err) {
				expect(err).toBe(null);
				done();
			});
		});

		it("should invoke the callback after finishing", function (done) {
			gun.put({
				key: 'value'
			}, done);
		});

		it("should work with nested objects", function () {
			gun.put({
				obj: {
					ect: {
						prop: true
					}
				}
			}).path('obj.ect.prop').val(function (val) {
				expect(val).toBe(true);
			});
		});

	});







	describe('get method', function () {

		beforeEach(function (done) {
			gun.path('get-test').put({
				success: true,
				object: {
					prop: 'value'
				}
			}).key('get-test-key', done);
		});

		it('should be able to find existing data', function (done) {
			gun.get('get-test-key').path('success').val(function (val) {
				expect(val).toBe(true);
				done();
			});
		});

		it('should not throw an error for existing keys', function (done) {
			gun.get('get-test-key', function (err) {
				expect(err).toBe(null);
				done();
			});
		});

		it('should not throw an error for non-existent keys', function (done) {
			gun.get("this key doesn't exist", function (err) {
				// No data? No problem. You should still be able to write.
				expect(err).toBe(null);
				done();
			});
		});

		it('should be able to find data by soul', function (done) {
			// path uses souls under the hood
			gun.get('get-test-key').path('object').path('prop').val(function (val) {
				expect(val).toBe('value');
				done();
			});
		});

	});





	describe('key method', function () {

		beforeEach(function (done) {
			gun.path('to more data').put({
				data: true
			}).key('master');

			gun.path('to data').set().path('hidden obscurely').put({
				prop: 'my context'
			}).key('first key').key('second key', done);
		});




		it('should provide a shortcut to that context', function (done) {
			gun.get('first key').path('prop').val(function (val) {
				expect(val).toBe('my context');
				done();
			});
		});


		it('should allow several keys to point to the same data', function (done) {
			gun.get('second key').path('prop').val(function (val) {
				expect(val).toBe('my context');
				done();
			});
		});

		it('should allow keys to point to entire graphs', function (done) {
			gun.get('master').path('data').val(function (val) {
				expect(val).toBe(true);
				done();
			});
		});

	});

});


// the gun module specification
describe('The gun-level', spec({
	module: setup('')
}));
