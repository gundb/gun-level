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

  // Allows other plugins to respond concurrently.
  const pluginInterop = (middleware) => function (context) {
    this.to.next(context);

    return middleware(context);
  };

  // Register the driver.
  Gun.on('get', pluginInterop(adapter.read));
  Gun.on('put', pluginInterop(adapter.write));
});

module.exports = Gun;
