/* eslint-disable max-params*/

/**
 * Used for merging two gun nodes together. Credit to Mark Nadal for
 * personally helping me figure this out.
 *
 * @private
 * @module gun-level/src/union
 */

import Gun from 'gun/gun';
const { HAM: merge } = Gun.union;

/**
 * Useless function, does literally nothing.
 *
 * @returns {undefined}
 */
function noop () {}

/**
 * I *think* it writes field/value/states to an object.
 *
 * @param  {Object} node - An object to add field, value, and state to.
 * @param  {String} field - The name of a field to apply.
 * @param  {Mixed} value - The value to place.
 * @param  {Number} state - The state of the field to set.
 * @returns {undefined} - The node is mutated instead of returning a copy.
 */
function merger (node, field, value, state) {
  Gun.is.node.state.ify([node], field, value, state);
}

/**
 * Take two nodes and merge them together using gun's conflict resolution
 * algorithm.
 *
 * @param  {Object} node - The object to merge into.
 * @param  {Object} update - The update to merge from.
 * @returns {Object} - The merged node (mutated).
 */
function union (node, update) {
	merge(node, update, noop, merger, noop);

	return node;
}

export default union;
