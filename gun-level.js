/*jslint node: true, nomen: true */
'use strict';

var Gun = require('gun'),
  fs = require('fs'),
  levelUP = require('level'),
  defaultFolder = null;

function ID() {
  this.id = Gun.text.random();
}


function setup(gun, opt) {
  opt = opt || {};
  opt.level = opt.level || {};
  var level, quit, id, folder = (opt.level.folder || defaultFolder);
  folder = folder && folder.replace(/\/$/, '') + '/';

  if (!gun.__.level) {
    gun.__.level = new ID();
  }
  id = gun.__.level.id;

  if (folder === null) {
    folder = 'level/';
    fs.exists(folder, function (exists) {
      if (exists) {
        defaultFolder = folder;
        return setup(gun, opt);
      }
      fs.mkdir(folder, function () {
        defaultFolder = folder;
        setup(gun, opt);
      });
    });
    return;
  }

  level = levelUP(folder + id, {
    valueEncoding: 'json'
  });

  function get(key, cb, opt) {
    if (!key) {
      return cb({
        err: "No key was given to .get()"
      });
    }
    level.get(key, function (err, graph) {
      if (err) {
        cb({
          err: err
        }, false);
      } else {
        cb(null, graph);
      }
    });
  }

  function put(graph, cb, opt) {
    var saved = 0,
      pending = 0;

    Gun.is.graph(graph, function (node, soul) {
      pending += 1;
      level.put(soul, node, function (err) {
        if (err) {
          cb({
            err: err
          }, false);
        }
        saved += 1;
        if (pending === saved) {
          cb(null, true);
        }
      });
    });
  }

  function key(name, soul, cb) {
    if (!name) {
      return cb({
        err: "No key was given to .key()"
      }, false);
    }
    if (!soul) {
      return cb({
        err: "No soul given to .key()"
      }, false);
    }
    level.put(name, soul, function (err) {
      if (err) {
        cb({
          err: err
        }, false);
      } else {
        cb(null, true);
      }
    });
  }

  opt.hooks = opt.hooks || {};
  gun.opt({
    hooks: {
      get: opt.hooks.get || get,
      put: opt.hooks.put || put,
      key: opt.hooks.key || key
    }
  }, true);

}


Gun.on('opt').event(setup);
