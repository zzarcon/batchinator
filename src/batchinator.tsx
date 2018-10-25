export type BatchingFunction<V> = (keys: any[]) => Promise<V[]>;
export type Loader<V> = (key: any) => Promise<V>;
export interface BatchingOptions {
  maxSize?: number;
}

export function batchinator<V>(batchingFn: BatchingFunction<V>, options?: BatchingOptions): Loader<V> {
  let keysMap = {};

  return (key) => {
    if (!Object.keys(keysMap).length) {
      setImmediate(async () => {
        const keys = Object.keys(keysMap);
        const results = await batchingFn(keys);
        
        keys.forEach((key, index) => {
          const resolver = keysMap[key];
          
          if (resolver) {
            resolver(results[index]);
          }
        });

        keysMap = {};
      });
    }

    return new Promise(resolve => {
      keysMap[key] = resolve;
    });
  };
};