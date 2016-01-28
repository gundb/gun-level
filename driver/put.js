/*jslint node: true */
'use strict';
var Gun, error, empty;
error = require('../util/error');
Gun = require('gun/gun');
empty = function () {};

function merger(vertex, field, val, state) {
  Gun.is.node.state.ify(
    [vertex],
    field,
    val,
    state
  );
}

module.exports = function (level) {
  return function put(graph, cb, opt) {
    var ops = [];

    Gun.is.graph(graph, function (node, soul) {
      ops.push({
        key: soul,
        value: node
      });
    });

    ops.forEach(function (op, index) {

      level.get(op.key, function (err, found) {
        if (found) {
          // merge the nodes together
          Gun.union.HAM(
            op.value,
            found,
            empty,
            merger,
            empty
          );
        }

        level.put(op.key, op.value, function (err) {
          if (err) {
            return error(cb)(err.message);
          }
          if (index === ops.length - 1) {
            cb(null, {
              ok: true
            });
          }
        });

      });

    });

  };
};
