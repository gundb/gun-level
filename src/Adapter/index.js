/* eslint-disable id-length*/
import Gun from 'gun/gun';
const writing = Symbol('In-process writes');
const notFound = /(NotFound|not found|not find)/i;
const options = {
  valueEncoding: 'json',
};

const { union } = Gun.HAM;

/**
 * Read/write hooks for Gun.
 *
 * @private
 * @param {LevelUP} level - A LevelUP interface.
 * @class
 */
export default class Adapter {

  static 'from' (level) {
    return new Adapter(level);
  }

  constructor (level) {

    // Save a reference to level.
    this.level = level;

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
  read (context) {
    const { get, gun } = context;
    const { level } = this;
    const { '#': key } = get;

    const done = (err, data) => gun._.root.on('in', {
      '@': context['#'],
      put: Gun.graph.node(data),
      err,
    });

    const value = level[writing][key];
    if (value) {
      return done(null, value);
    }

    // Read from level.
    return level.get(key, options, (err, result) => {

      // Error handling.
      if (err) {
        if (notFound.test(err.message)) {

          // Tell gun nothing was found.
          done(null);
          return;
        }

        done(err);
        return;
      }

      // Pass gun the result.
      done(null, result);
    });
  }

  /**
   * Write a every node in a graph to level.
   *
   * @param  {Object} context - A gun write context.
   * @returns {undefined}
   */
  write (context) {
    const { level } = this;
    const { put: graph, gun } = context;

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
    function writeHandler (err = null) {

      // Remove the in-process writes.
      keys.forEach((key) => {
        delete level[writing][key];
      });

      // Report whether it succeeded.
      gun._.root.on('in', {
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
    function writeWhenReady (counted) {

      // Wait until we've checked all the nodes before
      // submitting the batch.
      if (counted < keys.length) {
        return;
      }

      // Write all the nodes to level.
      batch.write(writeHandler);
    }

    // Each node in the graph...
    keys.forEach((uid) => {
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

        writeWhenReady(merged += 1);
      });

    });

  }

}
