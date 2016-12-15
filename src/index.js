/* eslint-disable id-length*/
import Adapter from './Adapter';
import Gun from 'gun/gun';

Gun.on('opt').event((gun, options) => {
  const { level } = options;

  // Filter out instances without the level option.
  if (!(level instanceof Object)) {
    return;
  }

  const adapter = Adapter.from(level);

  const { wire } = gun.__.opt;
  const wireGet = wire.get;
  const wirePut = wire.put;

  // Register the driver.
  gun.opt({
    wire: {
      get: function (lex, cb, o) {
        if (wireGet === null || wireGet === undefined) {
          adapter.read(lex, cb);
        } else {
          wireGet(lex, cb, o) || adapter.read(lex, cb);
        }
      },
      put: function (graph, cb, o) {
        if (wirePut === null || wirePut === undefined) {
          adapter.write(graph, cb);
        } else {
          wirePut(graph, cb, o) || adapter.write(graph, cb);
        }
      },
    },
  }, true);

});

module.exports = Gun;
