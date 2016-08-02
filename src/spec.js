import { describe, it, beforeEach } from 'mocha';
import expect from 'expect';
const memdown = require('memdown');
const levelup = require('levelup');
const Gun = require('gun/gun');
require('./index');

describe('Gun using level', function () {

	this.timeout(500);

	let gun;

	beforeEach(() => {
		const level = levelup('test', { db: memdown });
		gun = new Gun({ level });
	});

	it('should report not found data', (done) => {
		gun.get('data').not(() => done());
	});

	it('should successfully write data', (done) => {
		gun.get('data').put({ success: true }, (error) => {
			expect(error).toBeFalsy();
			done();
		});
	});

	it('should be able to read existing data', (done) => {
		gun.get('data').val((data) => {
			expect(data).toContain({ success: true });
			done();
		});
	});

	it('should merge with existing data', (done) => {
		const data = gun.put({ data: true }).key('data');
		data.val((value) => {
			expect(value).toContain({ success: true, data: true });
			done();
		});
	});

});
