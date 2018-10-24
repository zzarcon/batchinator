# rebatch
> Group method calls within the same tick


# Install

```
$ yarn add rebatch
```

# Usage

```typescript
import rebatch from 'rebatch';

const load = rebatch((keys: string[]) => {
  return new Promise<string[]>(resolve => {
    const newIds = ids.map(id => `${id}-foo`);

    resolve(newIds);
  });
});

load(1);
load(2);
```