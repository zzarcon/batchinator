# batchinator
> Group method calls within the same tick


# Install

```
$ yarn add batchinator
```

# Usage

```typescript
import batchinator from 'batchinator';

const load = batchinator((keys: string[]) => {
  return new Promise<string[]>(resolve => {
    const newIds = ids.map(id => `${id}-foo`);

    resolve(newIds);
  });
});

load(1);
load(2);
```