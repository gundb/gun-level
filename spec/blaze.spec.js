/*globals describe, it, pending, expect, beforeEach, afterAll, jasmine */
/*jslint node: true, nomen: true */
'use strict';

var fs = require('fs');
var blazer = require('../util/blaze');
var testFolder = require('./folder');
var remove = require('./remove');
var format = require('path');

function blaze(path) {
	var dest = path.split('/');
	dest = format.join.apply(format, [testFolder].concat(dest));
	blazer(dest);
	return dest;
}
function exists(path) {
	var dest = format.join(testFolder, path);
	return fs.existsSync(dest);
}

describe('The path-blazer', function () {

	it("shouldn't die without input", function () {
		expect(blazer).not.toThrow();
	});

	it('should be able to handle root-relative paths', function () {
		var rootPath = format.join(testFolder, 'root-blaze');
		blazer(rootPath);

		expect(fs.existsSync(rootPath)).toBe(true);
	});

	it('should be able to handle project-relative paths', function () {
		var path = 'project-blaze';
		blazer(path);

		expect(fs.existsSync(path)).toBe(true);
		remove(path);
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
		var file = format.join('create/path/to/the.file');
		blaze(file);
		expect(exists(file)).toBe(true);
	});

	it('should return the full path it blazed', function () {
		var fileName, path = 'folder/file.name';
		fileName = format.join(testFolder, 'folder', 'file.name');
		expect(blaze(path)).toBe(fileName);
	});

});
