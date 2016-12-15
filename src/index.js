/* eslint-disable no-underscore-dangle */
import Adapter from './Adapter';
import Gun from 'gun/gun';

Gun.on('opt', (context) => {
  const { level } = context.opt;

  // Filter out instances without the level option.
  if (!(level instanceof Object)) {
    return;
  }

  const adapter = Adapter.from(level);

  // Register the driver.
  Gun.on('get', adapter.read);
  Gun.on('put', adapter.write);

});

module.exports = Gun;
