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
	var wireGet = wire.get
	var wirePut = wire.put

	// Register the driver.
	gun.opt({
		wire: {
		      get: function (lex, cb, o) {
			wireGet(lex, cb, o) || adapter.read(lex, cb)
		      },
		      put: function (graph, cb, o) {
		        wirePut(graph, cb, o) || adapter.write(graph, cb)
		      }
		},
	}, true);

});

module.exports = Gun;
