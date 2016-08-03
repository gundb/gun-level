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

	// Register the driver.
	gun.opt({
		wire: {
			get: wire.get || adapter.read,
			put: wire.put || adapter.write,
		},
	}, true);

});

module.exports = Gun;
