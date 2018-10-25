export type BatchingFunction<V> = (keys: any[]) => Promise<V[]>;
export type Loader<V> = (key: any) => Promise<V>;
export interface BatchingOptions {
  maxSize?: number;
}

export interface CacheEntry<V> {
  promise: Promise<V>;
  resolver: (value: V) => void;
}

export function batchinator<V>(batchingFn: BatchingFunction<V>, options?: BatchingOptions): Loader<V> {
  let cache: {[key: string]: CacheEntry<V>} = {};

  return (key) => {
    if (!Object.keys(cache).length) {
      setImmediate(async () => {
        const keys = Object.keys(cache);
        const results = await batchingFn(keys);
        
        keys.forEach((key, index) => {
          if (!cache[key]) {return};
          const resolver = cache[key].resolver;
          
          resolver(results[index]);
        });

        cache = {};
      });
    }

    if (cache[key]) {
      return cache[key].promise;
    } else {
      cache[key] = createCacheEntry<V>();
    }

    const promise = new Promise<V>(resolve => {
      cache[key].resolver = resolve;
    });

    cache[key].promise = promise;

    return promise;
  };
};

function createCacheEntry<V> (): CacheEntry<V> {
  return {
    promise: Promise.resolve() as any,
    resolver() {}
  };
}