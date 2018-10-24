export type BatchingFunction = (keys: any[]) => Promise<any[]>;
export type Loader = (key: any) => Promise<any>;
export interface BatchingOptions {
  maxSize?: number;
}

export const rebatch = (batchingFn: BatchingFunction, options?: BatchingOptions): Loader => {
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