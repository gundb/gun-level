/*jslint node: true*/
var Gun = require('gun/gun');

Gun.chain.set = function (val, cb, opt) {
	'use strict';
	var ctx, drift, index, obj, gun = this;
	ctx = {};
	drift = Gun.text.ify(Gun.time.now() || 0).replace('.', 'D');
	cb = cb || function () {};
	opt = opt || {};

	if (!gun.back) {
		gun = gun.put({});
	}
	gun = gun.not(function (key) {
		return key ? this.put({}).key(key) : this.put({});
	});
	if (!val && !Gun.is.val(val)) {
		return gun;
	}
	obj = {};
	index = 'I' + drift + 'R' + Gun.text.random(5);
	obj[index] = val;
	return Gun.is.val(val) ? gun.put(obj, cb) : gun.put(obj, cb).path(index);
};
