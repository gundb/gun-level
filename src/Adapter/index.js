/* eslint-disable id-length*/
import Gun from 'gun/gun';
import union from '../union';
const options = {
	valueEncoding: 'json',
};

/**
 * Give the gun callback a resulting node, handling stream signals.
 *
 * @param  {Function} cb - The callback from gun.
 * @param  {Object} node - The node found from level.
 * @returns {undefined}
 */
function done (cb, node) {

	// Give gun the node.
	cb(null, node);

	// This generates a pointer for the node.
	const uid = Gun.is.node.soul(node);
	const rel = Gun.is.node.soul.ify({
		_: node._,
	}, uid);

	// Gun understands that pointer as the end of the stream.
	cb(null, rel);

	// Tell gun there's nothing else coming.
	cb(null, {});

}

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
		this.writing = {};
	}

	/**
	 * Read a key from LevelDB.
	 *
	 * @param  {Object} query - A lexical cursor passed by Gun.
	 * @param  {Function} cb - A callback to invoke on finishing.
	 * @returns {undefined}
	 */
	read (query, cb) {
		const { level } = this;
		const { '#': key } = query;

		const value = this.writing[key];
		if (value) {
			return done(cb, value);
		}

		// Read from level.
		return level.get(key, options, (err, result) => {

			// Error handling.
			if (err) {
				const notFound = err.message.match(/not found/i);
				if (notFound) {

					// Tell gun nothing was found.
					cb(null, null);
					return;
				}
				cb({ err });
				return;

			}

			// Pass gun the result.
			done(cb, result);
		});
	}

	/**
	 * Write a every node in a graph to level.
	 *
	 * @param  {Object} graph - A graph instance from gun.
	 * @param  {Function} cb - A callback to invoke when finished.
	 * @returns {undefined}
	 */
	write (graph, cb) {
		const { level } = this;
		const adapter = this;

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
		function writeHandler (err) {

			// Remove the in-process writes.
			keys.forEach((key) => {
				delete adapter.writing[key];
			});

			// Report whether it succeeded.
			if (err) {
				cb({ err });
			} else {
				cb(null);
			}
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
			const node = graph[uid];
			const writing = this.writing[uid];

			// Check to see if it's in the process of writing.
			if (writing) {
				union(node, writing);
				merged += 1;
				batch.put(uid, node, options);

				writeWhenReady(merged);
				return;
			}

			this.writing[uid] = node;

			// Check to see if it exists.
			level.get(uid, options, (error, result) => {

				// If we already have data...
				if (!error) {

					// Merge with the write.
					union(node, result);
				}

				// Add the node to our write batch.
				batch.put(uid, node, options);

				writeWhenReady(merged += 1);
			});

		});

	}

}
