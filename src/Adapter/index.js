/* eslint-disable id-length*/
import Gun from 'gun/gun';
const writing = Symbol('In-process writes');
const notFound = /(NotFound|not found|not find)/i;
const options = {
  valueEncoding: 'json',
};

// Gun merge algorithm, authored by Mark Nadal.
const union = (vertex, node, opt) => {
  if (!node || !node._) {
    return;
  }
  vertex = vertex || Gun.state.to(node);
  if (!vertex || !vertex._) {
    return;
  }
  opt = Gun.num.is(opt) ? { machine: opt } : { machine: Gun.state() };
  opt.union = Gun.obj.copy(vertex);
  if (
    !Gun.node.is(node, function(val, key) {
      const HAM = Gun.HAM(
        opt.machine,
        Gun.state.is(node, key),
        Gun.state.is(vertex, key, true),
        val,
        vertex[key],
      );
      if (!HAM.incoming) {
        return;
      }
      Gun.state.to(node, key, opt.union);
    })
  ) {
    return;
  }

  return opt.union; // eslint-disable-line
};

/**
 * Read/write hooks for Gun.
 *
 * @private
 * @param {LevelUP} level - A LevelUP interface.
 * @class
 */
export default class Adapter {
  static from(level, context) {
    return new Adapter(level, context);
  }

  constructor(level, ctx) {
    // Save a reference to level and the gun instance
    this.level = level;
    this.ctx = ctx;

    // Preserve the `this` context for read/write calls.
    this.read = this.read.bind(this);
    this.write = this.write.bind(this);

    // In-process writes.
    level[writing] = level[writing] || {};
  }

  /**
   * Read a key from LevelDB.
   *
   * @param  {Object} context - A gun request context.
   * @returns {undefined}
   */
  read(context) {
    const { get } = context;
    const { level } = this;
    const { '#': key } = get;
    const value = level[writing][key];
    if (value) {
      return this.afterRead(context, null, value);
    }

    // tell gun nothing was found if no key available
    //  - probably wrong somewhere else if it tries to read w/o key
    //  - TODO: possibly warn?
    //  - atm. prefer server not to go down + little time
    if (!key) return this.afterRead(context, null);

    // Read from level.
    return level.get(key, options, (err, result) => {
      // Error handling.
      if (err) {
        if (notFound.test(err.message)) {
          // Tell gun nothing was found.
          this.afterRead(context, null);
          return;
        }

        this.afterRead(context, err);
        return;
      }

      // Pass gun the result.
      this.afterRead(context, null, result);
    });
  }

  /**
   * Return data to Gun
   *
   * @param  {Object} context - A gun request context.
   * @param  {Error|null} err - An Error object, if any
   * @param  {Object|null|undefined} data - The node retrieved, if found
   * @returns {undefined}
   */
  afterRead(context, err, data) {
    this.ctx.on('in', {
      '@': context['#'],
      put: Gun.graph.node(data),
      err,
    });
  }

  /**
   * Write a every node in a graph to level.
   *
   * @param  {Object} context - A gun write context.
   * @returns {undefined}
   */
  write(context) {
    const self = this;
    const { level } = this;
    const { put: graph } = context;

    // Create a new batch write.
    const batch = level.batch();

    const keys = Object.keys(graph);
    let merged = 0;

    /**
    * Report errors and clear out the in-process write cache.
    *
    * @param  {Error} [err] - An error given by level.
    * @returns {undefined}
    */
    function writeHandler(err = null) {
      // Remove the in-process writes.
      keys.forEach(key => {
        delete level[writing][key];
      });

      // Report whether it succeeded.
      self.ctx.on('in', {
        '@': context['#'],
        ok: !err,
        err,
      });
    }

    /**
    * Determine whether a write should happen and invoke it,
    * passing the handler.
    *
    * @param  {Number} counted - The number of keys merged.
    * @returns {undefined}
    */
    function writeWhenReady(counted) {
      // Wait until we've checked all the nodes before
      // submitting the batch.
      if (counted < keys.length) {
        return;
      }

      // Write all the nodes to level.
      batch.write(writeHandler);
    }

    // Each node in the graph...
    keys.forEach(uid => {
      let node = graph[uid];
      const value = level[writing][uid];

      // Check to see if it's in the process of writing.
      if (value) {
        node = union(node, value);
        merged += 1;
        batch.put(uid, node, options);

        writeWhenReady(merged);
        return;
      }

      level[writing][uid] = node;

      // Check to see if it exists.
      level.get(uid, options, (error, result) => {
        // If we already have data...
        if (!error) {
          // Merge with the write.
          node = union(node, result);
        }

        // Add the node to our write batch.
        batch.put(uid, node, options);

        writeWhenReady((merged += 1));
      });
    });
  }
}
