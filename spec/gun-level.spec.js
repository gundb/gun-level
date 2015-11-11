/*jslint node: true, nomen: true */
/*globals describe, it, xit, expect, beforeEach, afterAll */
'use strict';

var Gun = require('../gun-level'),
  fs = require('fs'),
  gun;


var testFolders = [];


function clean(path) {
  if (!path) {
    return;
  }
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path.replace(/\/*$/, '/') + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        clean(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
      if (index === 'CURRENT') {
        fs.unlinkSync(curPath);
      }
    });
    if (fs.existsSync(path)) {
      fs.rmdirSync(path);
    }
  }
  return null;
}

function setup(folder) {
  testFolders.push(folder);
  return new Gun({
    level: {
      folder: folder
    }
  });
}
afterAll(function () {
  testFolders.map(clean);
});

describe("gun-level's", function () {

  // Fresh instance each test
  beforeEach(function (done) {
    gun = setup('spec/db-test-folder/').get('test').set();
    done();
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

    it("shouldn't give an error for a generic put", function (done) {
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
      }, function (err) {
        expect(true).toBe(true);
        done();
      });
    });

  });







  describe('get method', function () {

    beforeEach(function (done) {
      gun.path('get-test').put({
        success: true
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

  });





  describe('key method', function () {

    beforeEach(function (done) {
      gun.path('to more data').put({
        data: true
      }).key('master');

      gun.path('to data').set().path('hidden obscurely').put({
        prop: 'my context'
      }).key('first key').key('second key').key('master', done);
    });




    it('should provide a shortcut to that context', function (done) {
      gun.get('first key').path('prop').val(function (val) {
        expect(val).toBe('my context');
        done();
      });
    });



    // Only the first test will fulfill. The rest
    // are never called, regardless of order.
    xit('should allow several keys to point to the same data', function (done) {
      gun.get('second key').path('prop').val(function (val) {
        expect(val).toBe('my context');
        done();
      });
    });

    xit('should allow keys to point to entire graphs', function (done) {
      gun.get('master').path('data').val(function (val) {
        expect(val).toBe('true');
        done();
      });
    });

  });

  describe('folder option', function () {


    it('should let you point to any folder', function () {
      var folder = 'tomato-potato';
      setup(folder).get('thing').set();

      expect(fs.existsSync(folder)).toBe(true);
    });

    it('should default to "./level/"', function () {
      setup();
      expect(fs.existsSync('./level')).toBe(true);
    });

  });

});
