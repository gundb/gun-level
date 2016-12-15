import { describe, it, before } from 'mocha';
import expect from 'expect';
import union from './index';
import Gun from 'gun/gun';
const node = Gun.is.node.ify;

describe('The union function', () => {

  let data, update;

  before(() => {
    data = node({ data: false });
    update = node({ data: true, property: 'added' });
  });

  it('should merge two objects', () => {
    const result = union(data, update);
    expect(result.data).toBe(true);
  });

  it('should add new properties', () => {
    const result = union(data, update);
    expect(result).toContain({
      property: 'added',
      data: true,
    });
  });

});
