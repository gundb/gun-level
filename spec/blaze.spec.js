/*globals describe, it, pending, expect, beforeEach, afterAll, jasmine */
/*jslint node: true */
'use strict';

var fs = require('fs');
var blazer = require('../util/blaze');
var testFolder = require('./folder');

function blaze(path) {
	return blazer(testFolder + path);
}
function exists(path) {
	return fs.existsSync(testFolder + path);
}

describe('The path-blazer', function () {

	it("shouldn't die without input", function () {
		expect(blazer).not.toThrow();
	});

	it('should be able to handle root-relative paths', function () {
		var rootPath = testFolder + 'root-blaze';
		blazer(rootPath);

		expect(fs.existsSync(rootPath)).toBe(true);
	});

	it('should be able to build a single folder', function () {
		blaze('folder');
		expect(exists('folder')).toBe(true);
	});

	it('should be able to build a path several folders deep', function () {
		var path = 'deeply/nested/folder';
		blaze(path);
		expect(exists(path)).toBe(true);
	});

	it('should be able to create files', function () {
		var file = 'file.name';
		blaze(file);
		expect(exists(file)).toBe(true);
	});

	it('should be able to blaze a path to a new file', function () {
		var file = 'create/path/to/the.file';
		blaze(file);
		expect(exists(file)).toBe(true);
	});

	it('should return the full path it blazed', function () {
		var path = 'folder/file.name',
			fileName = testFolder + 'folder/file.name';
		expect(blaze(path)).toBe(fileName);
	});

});
