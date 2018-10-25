import { batchinator } from "../src";

describe('Batchinator', () => {
  it('Should return right value per key', async () => {
    const fetchIds = (ids: string[]): Promise<string[]> => {
      return new Promise<string[]>(resolve => {
        const newIds = ids.map(id => `${id}-foo`);

        resolve(newIds);
      });
    }
    
    const load = batchinator<string>((keys: string[]) => {
      return fetchIds(keys);
    });

    const [id1, id2] = await Promise.all([load(1), load(2)]);

    expect(id1).toEqual('1-foo')
    expect(id2).toEqual('2-foo')
  });

  it('Should group calls to batching function', async () => {
    const batchingFn = jest.fn().mockReturnValue(Promise.resolve([]));
    const load = batchinator(batchingFn);

    expect(batchingFn).toBeCalledTimes(0);
    load(1);
    load(2);
    expect(batchingFn).toBeCalledTimes(0);
    
    await Promise.all([load(1), load(2)]);

    expect(batchingFn).toBeCalledTimes(1);
    await load(3);

    expect(batchingFn).toBeCalledTimes(2);
  });

  it.skip('should return the same result for the same key', async () => {
    const batchingFn = jest.fn().mockReturnValue(Promise.resolve(['one', 'two']));
    const load = batchinator(batchingFn);

    console.log(await load(1))
    console.log(await load(2))
    expect(await load(1)).toEqual(await load(1))
    expect(await load(2)).toEqual(await load(2))
    expect(await load(1)).not.toEqual(await load(2));
  });

  it('should return same promise for same key', () => {
    const batchingFn = jest.fn().mockReturnValue(Promise.resolve([]));
    const load = batchinator(batchingFn);

    expect(load(1) === load(1)).toBeTruthy();
    expect(load(1) !== load(2)).toBeTruthy();
  });
});
