import { describe, it, beforeEach } from 'mocha';
import expect from 'expect';
import memdown from 'memdown';
import levelup from 'levelup';
import Gun from 'gun/gun';
import './index';

describe('Gun using level', function () {

  this.timeout(500);

  let gun, level, key;

  beforeEach(() => {
    key = Math.random().toString(36).slice(2);
    level = levelup('test', { db: memdown });
    gun = new Gun({ level });
  });

  it('should report not found data', (done) => {
    gun.get('no such key').not(() => done());
  });

  it('should successfully write data', (done) => {
    gun.get(key).put({ success: true }, (error) => {
      expect(error).toBeFalsy();
      done();
    });
  });

  it('should be able to read existing data', (done) => {
    gun.get(key).put({ success: true });
    gun.get(key).val((data) => {
      expect(data).toContain({ success: true });
      done();
    });
  });

  it('should merge with existing data', (done) => {
    gun.put({ data: true }).key(key);
    gun.put({ success: true }).key(key);
    const data = gun.get(key);

    data.val((value) => {
      expect(value).toContain({ success: true, data: true });
      done();
    });
  });

  it('should resolve circular references', (done) => {
    const bob = gun.get('bob').put({ name: 'Bob' });
    const dave = gun.get('dave').put({ name: 'Dave' });

    bob.path('friend').put(dave);
    dave.path('friend').put(bob);

    bob.path('friend.friend.name').val((name) => {
      expect(name).toBe('Bob');
      done();
    });
  });

});
