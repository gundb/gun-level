/* eslint-disable require-jsdoc, id-length */
import { describe, it, beforeEach } from 'mocha';
import expect from 'expect';
import memdown from 'memdown';
import levelup from 'levelup';
import Gun from 'gun/gun';
import './index';

let gun, level, key;

/**
 * Refresh the level instance, effectively clearing out
 * any data stored in memory
 * 
 * @returns {undefined}
 */
const makeLevel = () => {
  level = levelup('test', { db: memdown });
};

/**
 * Make a new instance of Gun but do not refresh the level instance
 * 
 * This means that any part of the Graph stored in Gun is wiped
 * out but that it is still in level (as long as makeLevel isn't also called)
 * 
 * @returns {Gun} A gun instance
 */
const makeGun = () => {
  gun = Gun({ level });
  return gun;
};

/**
 * Integration tests between Level, Gun, and Gun-Level adapter
 */
describe('Gun using level', function() {
  this.timeout(2000);

  beforeEach(() => {
    key = Math.random().toString(36).slice(2);

    // Refresh level and Gun's state
    makeLevel();
    makeGun();
  });

  it('should report not found data', done => {
    gun.get('no such key').val(notFound => {
      expect(notFound).toBe(undefined);
      done();
    });
  });

  it('should successfully write data', done => {
    gun.get(key).put({ success: true }, ctx => {
      expect(ctx.err).toBeFalsy();
      done();
    });
  });

  it('should be able to read existing data', done => {
    gun.get(key).put({ success: true });
    makeGun().get(key).val(data => {
      expect(data).toContain({ success: true });
      done();
    });
  });

  it('should merge with existing data', done => {
    const g = makeGun();

    // write initial data
    g.get(key).put({ data: true }, () => {
      // add to it
      g.get(key).put({ success: true }, () => {
        // verify data merge
        makeGun().get(key).val(value => {
          expect(value).toContain({ success: true, data: true });
          done();
        });
      });
    });
  });

  it('should resolve circular references', done => {
    const bob = gun.get('bob').put({ name: 'Bob' });
    const dave = gun.get('dave').put({ name: 'Dave' });

    bob.get('friend').put(dave);
    dave.get('friend').put(bob);

    bob.get('friend').get('friend').val(value => {
      expect(value.name).toBe('Bob');
      done();
    });
  });

  it('should handle sets', done => {
    const g = makeGun();
    const profiles = g.get('profiles');
    const bob = g.get('bob').put({ name: 'Bob' });
    const dave = g.get('dave').put({ name: 'Dave' });

    profiles.set(bob).set(dave);

    let count = 0;
    makeGun().get('profiles').map().on(profile => {
      // Check nodes for proper form
      if (profile.name === 'Bob') {
        expect(profile).toContain({ name: 'Bob' });
      } else if (profile.name === 'Dave') {
        expect(profile).toContain({ name: 'Dave' });
      }

      // ensure all profiles are found before completing
      count += 1;
      if (count === 2) {
        done();
      }
    });
  });
});
