/* eslint-disable require-jsdoc*/
import {
  describe,
  it,
  before,
  beforeEach,
  afterEach,
} from 'mocha';
import expect, { spyOn } from 'expect';
import Adapter from './';
import levelup from 'levelup';
import memdown from 'memdown';
import Gun from 'gun/gun';

describe('An adapter', function () {

  this.timeout(50);

  function noop () {}
  let adapter;
  let lex;
  const level = levelup('test', {
    db: memdown,
  });

  beforeEach(() => {
    adapter = new Adapter(level);
    const key = Math.random().toString(36).slice(2);
    lex = { '#': key };
  });

  describe('read', () => {

    const spy = spyOn(level, 'get');
    afterEach(() => spy.reset());

    it('should call `level.get`', () => {
      adapter.read(lex, noop);

      expect(spy).toHaveBeenCalled();
    });

    it('should use the `#` property as the key', () => {
      adapter.read(lex, noop);

      const uid = spy.calls[0].arguments[0];
      expect(uid).toBe(lex['#']);
    });

    it('should always use json encoding', () => {
      adapter.read(lex, noop);
      const [, options] = spy.calls[0].arguments;
      expect(options.valueEncoding).toBe('json');
    });

    it('should not error when keys cannot be found', (done) => {
      spy.andCallThrough();

      adapter.read(lex, (error) => {
        expect(error).toBe(null);
        done();
      });
    });

    it('should pass the error on unrecognized errors', (done) => {
      const error = new Error('Part of the test');
      spy.andCall((key, options, done) => done(error));

      adapter.read(lex, ({ err }) => {
        expect(err).toBe(error);
        done();
      });
    });

  });

  describe('write', () => {

    let graph, spy;

    before(() => {

      graph = {
        potato: Gun.is.node.ify({
          hello: 'world',
        }),
      };
      spy = spyOn(level, 'batch').andCallThrough();

    });

    afterEach(() => spy.reset());

    it('should create a level batch write', () => {
      adapter.write(graph, noop);

      expect(spy).toHaveBeenCalled();
    });

  });

});
