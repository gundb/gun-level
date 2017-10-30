/* eslint-env mocha */
/* eslint-disable require-jsdoc, id-length */
import expect, { spyOn } from 'expect';
import Adapter from './';
import levelup from 'levelup';
import memdown from 'memdown';
import encode from 'encoding-down';
import Gun from 'gun/gun';

const node = obj => Gun.node.ify(obj, Gun.state.map());

describe('An adapter', function() {
  this.timeout(100);

  let adapter, lex, gun, ctx;
  const level = levelup(encode(memdown('test'), { valueEncoding: 'json' }));
  const context = new Gun({ level });

  beforeEach(() => {
    adapter = new Adapter(level, context);
    const key = Gun.text.random();
    lex = { '#': key };
    gun = context;
  });

  describe('read', () => {
    beforeEach(() => {
      ctx = {
        '#': Gun.text.random(),
        get: lex,
        gun,
      };
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

    it('should respond when it finds data', done => {
      const value = node({ value: true });

      adapter.ctx.on('put', result => {
        expect(result['@']).toBe(ctx['#']);
        expect(result.put).toEqual(Gun.graph.node(value));
        done();
      });

      // Setup a Level response.
      read.andCall((key, opt, cb) => cb(null, value));

      // Initialize read request
      adapter.read(ctx);
    });

    it('should not error out on NotFound results', () => {
      // Spy on the after read method
      const afterRead = spyOn(adapter, 'afterRead');

      // Fake a not-found response.
      read.andCall((key, opt, cb) => {
        const err = new Error('Key not found');
        cb(err);
      });

      // Initialize fake read request
      adapter.read(ctx);

      // Assertions
      expect(afterRead).toHaveBeenCalled();
      const [requestConect, error] = afterRead.calls[0].arguments;
      expect(requestConect).toContain({
        '#': ctx['#'],
      });
      expect(error).toBe(null);

      // Reset state
      afterRead.reset();
      afterRead.restore();
    });

    it('should pass the error on unrecognized errors', () => {
      // Spy on the after read method
      const afterRead = spyOn(adapter, 'afterRead');

      // Setup test
      const error = new Error('Part of the test');
      read.andCall((key, options, cb) => cb(error));

      // Run test
      adapter.read(ctx);

      // Assertions
      expect(afterRead).toHaveBeenCalled();
      const [, returnedErr] = afterRead.calls[0].arguments;
      expect(returnedErr).toBe(error);

      // Reset state
      afterRead.reset();
      afterRead.restore();
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
