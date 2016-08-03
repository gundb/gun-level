import { describe, it, beforeEach } from 'mocha';
import expect from 'expect';
import memdown from 'memdown';
import levelup from 'levelup';
import Gun from 'gun/gun';
import './index';

describe('Gun using level', function () {

	this.timeout(500);

	let gun, level;

	beforeEach(() => {
		level = levelup('test', { db: memdown });
		gun = new Gun({ level });
	});

	it('should report not found data', (done) => {
		gun.get('no such key').not(() => done());
	});

	it('should successfully write data', (done) => {
		gun.get('data').put({ success: true }, (error) => {
			expect(error).toBeFalsy();
			done();
		});
	});

	it('should be able to read existing data', (done) => {
		gun.get('data').put({ success: true });
		gun.get('data').val((data) => {
			expect(data).toContain({ success: true });
			done();
		});
	});

	it('should merge with existing data', (done) => {
		gun.put({ data: true }).key('data');
		gun.put({ success: true }).key('data');
		const data = gun.get('data');

		data.val((value) => {
			expect(value).toContain({ success: true, data: true });
			done();
		});
	});

});
