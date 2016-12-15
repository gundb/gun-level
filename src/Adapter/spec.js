/* eslint-env mocha */
/* eslint-disable require-jsdoc, id-length */
import expect, { spyOn, createSpy } from 'expect';
import Adapter from './';
import levelup from 'levelup';
import memdown from 'memdown';
import Gun from 'gun/gun';

const node = (obj) => Gun.node.ify(obj, Gun.state.map());

describe('An adapter', function () {

  this.timeout(50);

  let adapter, lex, gun, ctx;
  const level = levelup('test', {
    db: memdown,
  });

  beforeEach(() => {
    adapter = new Adapter(level);
    const key = Gun.text.random();
    lex = { '#': key };
    gun = {
      on: Gun.on,
    };
    gun._ = { root: gun };
  });

  describe('read', () => {
    let spy;

    beforeEach(() => {
      ctx = {
        '#': Gun.text.random(),
        get: lex,
        gun,
      };
      spy = createSpy();
    });

    const read = spyOn(level, 'get');
    afterEach(() => read.reset());
    after(() => read.restore());

    it('should call `level.get`', () => {
      adapter.read(ctx);

      expect(read).toHaveBeenCalled();
    });

    it('should use the `#` property as the key', () => {
      adapter.read(ctx);

      const uid = read.calls[0].arguments[0];
      expect(uid).toBe(lex['#']);
    });

    it('should always use json encoding', () => {
      adapter.read(ctx);
      const [, options] = read.calls[0].arguments;
      expect(options.valueEncoding).toBe('json');
    });

    it('should respond when it finds data', () => {
      gun.on('in', spy);
      const value = node({ value: true });

      // Fake a Level response.
      read.andCall(
        (key, opt, cb) => cb(null, value)
      );

      adapter.read(ctx);

      // Validate the adapter's response.
      expect(spy).toHaveBeenCalled();
      const [result] = spy.calls[0].arguments;
      expect(result['@']).toBe(ctx['#']);
      expect(result.put).toEqual(Gun.graph.node(value));
    });

    it('should not error out on NotFound results', () => {
      gun.on('in', spy);

      // Fake a not-found response.
      read.andCall((key, opt, cb) => {
        const err = new Error('Key not found');
        cb(err);
      });

      adapter.read(ctx);

      expect(spy).toHaveBeenCalled();
      const [result] = spy.calls[0].arguments;

      expect(result).toContain({
        err: null,
        '@': ctx['#'],
        put: Gun.graph.node(),
      });
    });

    it('should pass the error on unrecognized errors', () => {
      const error = new Error('Part of the test');
      gun.on('in', spy);
      read.andCall(
        (key, options, cb) => cb(error)
      );

      adapter.read(ctx);
      expect(spy).toHaveBeenCalled();
      const [result] = spy.calls[0].arguments;
      expect(result.err).toBe(error);
    });

  });

  describe('write', () => {

    let graph, write;

    before(() => {

      graph = {
        potato: Gun.node.ify({
          hello: 'world',
        }),
      };
      write = spyOn(level, 'batch').andCallThrough();
      ctx.put = graph;

    });

    afterEach(() => write.reset());

    after(() => write.restore());

    it('should create a level batch write', () => {
      adapter.write(ctx);

      expect(write).toHaveBeenCalled();
    });

  });

});
