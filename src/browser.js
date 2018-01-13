import Adapter from './Adapter/browser';
import Gun from 'gun';

Gun.on('opt', function(context) {
  // Pass to subsequent opt handlers
  this.to.next(context);

  const { level } = context.opt;

  // Filter out instances without the level option.
  if (!(level instanceof Object)) {
    return;
  }

  const adapter = Adapter.from(level, context);

  // Allows other plugins to respond concurrently.
  const pluginInterop = middleware =>
    function(ctx) {
      this.to.next(ctx);

      return middleware(ctx);
    };

  // Register the driver.
  context.on('get', pluginInterop(adapter.read));
  context.on('put', pluginInterop(adapter.write));
});

module.exports = Gun;
