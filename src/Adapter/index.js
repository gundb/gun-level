/* eslint-disable id-length*/
const Gun = require('gun/gun');
const options = {
	valueEncoding: 'json',
};

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
	}

	/**
	 * Read a key from LevelDB.
	 *
	 * @param  {Object} query - A lexical cursor passed by Gun.
	 * @param  {Function} done - A callback to invoke on finishing.
	 * @returns {undefined}
	 */
	read (query, done) {
		const { level } = this;
		const { '#': key } = query;

		// Read from level.
		level.get(key, options, (err, result) => {

			// Error handling.
			if (err) {
				const notFound = err.message.match(/not found/i);
				if (notFound) {

					// Tell gun nothing was found.
					return done(null, null);
				}

				// Generic error.
				return done({ err });
			}

			// Pass gun the result.
			done(null, result);

			// This generates a pointer for the node.
			const uid = Gun.is.node.soul(result);
			const rel = Gun.is.node.soul.ify({
				_: result._,
			}, uid);

			// Gun understands that pointer as the end of the stream.
			done(null, rel);

			// Tell gun there's nothing else coming.
			return done(null, {});
		});
	}

	/**
	 * Write a every node in a graph to level.
	 *
	 * TODO: The writes need to merge with existing data.
	 * @param  {Object} graph - A graph instance from gun.
	 * @param  {Function} done - A callback to invoke when finished.
	 * @returns {undefined}
	 */
	write (graph, done) {
		const { level } = this;

		// Create a new batch write.
		const batch = level.batch();

		// Each node in the graph...
		Object.keys(graph).forEach((uid) => {
			const node = graph[uid];

			// Add it to the batch.
			batch.put(uid, node, options);
		});

		// Write all the nodes!
		batch.write((err) => {
			if (err) {

				// Report any errors.
				done({ err });
			} else {
				done(null);
			}
		});
	}
}
