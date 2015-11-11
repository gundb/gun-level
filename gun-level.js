/*jslint node: true, nomen: true */
'use strict';

var Gun = require('gun'),
  fs = require('fs'),
  levelUP = require('level'),
  defaultFolder = 'level/';

var folder = {};


function valid(err) {
  var noData = 'Key not found in database';

  if (!err) {
    return false;
  }
  if (err.message.match(noData)) {
    return false;
  }
  return true;
}


function patch(opt) {
  // Give default options where they aren't defined

  opt = opt || {};
  opt.hooks = opt.hooks || {};
  opt.level = opt.level || {};

  opt.level.folder = opt.level.folder || defaultFolder;

  return opt;
}



function blaze(path) {
  var depth = [];

  function recurse(path) {
    if (!path) {
      return 'done!';
    }
    path = path.split('/').filter(function (dir) {
      return !!dir;
    });
    depth.push(path.shift());
    var folder = depth.join('/');
    if (fs.existsSync(folder)) {
      return recurse(path && path.join('/'));
    } else {
      fs.mkdirSync(folder);
      return recurse(path && path.join('/'));
    }
  }

  return recurse(path);
}



function setup(gun, opt) {

  opt = patch(opt);

  var driver, level, path = opt.level.folder;


  // level instances can't share a database
  // so let gun share a level instance
  if (folder[path]) {
    level = folder[path];

  } else {
    blaze(path);

    level = folder[path] = levelUP(path, {
      valueEncoding: 'json'
    });
  }




  function getSoul(soul, cb, opt, count) {

    level.get(soul, function (err, node) {
      var graph = {},
        soul = Gun.is.soul.on(node);

      if (valid(err)) {
        return cb({
          err: err
        }, false);
      }

      graph[soul] = node;
      cb(null, graph);

      graph[soul] = Gun.union.pseudo(soul);
      cb(null, graph);

      count.found += 1;
      if (count.requested === count.found) {
        // terminate
        cb(null, {});
      }
    });
  }



  function getKey(key, cb, opt, count) {

    level.get(key, function (err, souls) {

      if (!souls) {
        cb(null, null);
      }

      // map over each soul in the graph
      Gun.obj.map(souls, function (rel, soul) {
        count.requested += 1;

        // get that soul
        getSoul(soul, cb, opt, count);
      });
    });
  }


  driver = {
    get: function (key, cb, opt) {
      var soul;

      if (!key) {
        return cb({
          err: "No data was given to .get()"
        }, false);
      }

      soul = Gun.is.soul(key);
      if (soul) {
        getSoul(soul, cb, opt, {
          requested: 1,
          found: 0
        });
      } else {
        // getKey depends on getSouls
        getKey(key, cb, opt, {
          requested: 0,
          found: 0
        });
      }

    },



    put: function (graph, cb, opt) {
      var saved = 0,
        pending = 0;

      Gun.is.graph(graph, function (node, soul) {
        pending += 1;
        level.put(soul, node, function (err) {
          if (valid(err)) {
            return cb({
              err: err
            }, false);
          }
          saved += 1;
          if (pending === saved) {
            cb(null, true);
          }
        });
      });

    },



    key: function (name, soul, cb) {
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
      level.get(name, function (err, graph) {
        if (valid(err)) {
          return cb({
            err: err
          }, false);
        }
        graph = graph || {};
        var relation = {
          '#': soul
        };
        graph[soul] = relation;
        level.put(name, graph, function (err) {
          if (valid(err)) {
            return cb({
              err: err
            }, false);
          }
          cb(null, true);
        });

      });

    }
  };









  gun.opt({
    hooks: {
      get: opt.hooks.get || driver.get,
      put: opt.hooks.put || driver.put,
      key: opt.hooks.key || driver.key
    }
  }, true);

}


Gun.on('opt').event(setup);


module.exports = Gun;
