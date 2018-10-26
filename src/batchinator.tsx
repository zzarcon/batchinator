export type BatchingFunction<K, V> = (keys: K[]) => Promise<V[]>;
export type Loader<K, V> = (key: K) => Promise<V>;
export interface BatchingOptions {
  maxSize?: number;
}

export interface CacheEntry<V> {
  promise: Promise<V>;
  resolver: (value: V) => void;
}

export function batchinator<K, V>(batchingFn: BatchingFunction<K, V>, options?: BatchingOptions): Loader<K, V> {
  const cache = new Map<K, CacheEntry<V>>();

  return (key) => {
    if (!Object.keys(cache).length) {
      setImmediate(async () => {
        const keys = [...cache.keys()];
        const results = await batchingFn(keys);
        
        keys.forEach((key, index) => {
          if (!cache.has(key)) {return};
          const resolver = cache.get(key).resolver;
          
          resolver(results[index]);
        });

        cache.clear();
      });
    }

    if (cache.has(key)) {
      return cache.get(key).promise;
    } else {
      cache.set(key, createCacheEntry<V>());
    }

    const promise = new Promise<V>(resolve => {
      cache.get(key).resolver = resolve;
    });

    cache.get(key).promise = promise;

    return promise;
  };
};

function createCacheEntry<V> (): CacheEntry<V> {
  return {
    promise: Promise.resolve() as any,
    resolver() {}
  };
}