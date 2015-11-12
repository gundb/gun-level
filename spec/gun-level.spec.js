/*jslint node: true, nomen: true */
/*globals describe, it, pending, expect, beforeEach, afterAll */
'use strict';

var Gun = require('../gun-level'),
  fs = require('fs'),
  testedDefault = false,
  gun;




var testFolder = 'spec/db-test/';




function remove(path) {
  if (!path) {
    return;
  }
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path.replace(/\/*$/, '/') + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        remove(curPath);
      } else {
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
  return new Gun({
    level: {
      folder: folder ? (testFolder + folder) : null
    },
    file: false
  });
}


function exists(folder) {
  return fs.existsSync(testFolder + folder);
}

afterAll(function () {
  remove(testFolder);
  if (testedDefault) {
    remove('level');
  }
});

describe("gun-level's", function () {

  // Fresh instance each test
  beforeEach(function (done) {
    gun = setup('spec/db-test-folder/').get('test').set();
    done();
  });



  describe('folder option', function () {

    it('should let you point to any folder', function () {
      var folder = 'tomato-potato';
      setup(folder).get('thing').set();
      expect(exists(folder)).toBe(true);
    });

    it('should allow paths at any depth', function () {
      var folder = 'really/deep/path/';
      setup(folder);
      expect(exists(folder)).toBe(true);
    });

    it("shouldn't break with weird path names", function () {
      setup('//super/weird-path/name...thing ///');
      expect(exists('super/weird-path/name...thing /')).toBe(true);
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
