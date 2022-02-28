# @vgerbot/lazy

A library for defining lazily evaluated properties.
Some property values that are expensive to generate can delay initialization until the property is needed.

In some scenarios, some attribute values do not need to be initialized immediately at the beginning,
and initializing these attributes immediately has a great impact on performance.
You can use a lazy evaluation strategy to delay initialization until the property values are required to improve performance.

## Install

```bash
npm i @vgerbot/lazy
```

## Usage


### `@lazyMember` decorator

>
> `@lazyMember` requires the `"experimentalDecorators": true` in your `tsconfig.json` file
>

```ts
import { lazyMember } from '@vgerbot/lazy';

function getFriends(id: string, params: Record<string, string | number> = {}): Promise<User[]> {
    const url = new URL('http://api.domain.com/friends');
    url.searchParams.append('userId', id);
    for(const key in params) {
        url.searchParams.append(key, params[key]);
    }
    console.log('fetch: ',url);
    return fetch(url)
        .then(resp => {
            return resp.json()
        })
        .then(data => userListOf(data));
}

class User {
    @lazyMember<User, 'friends'>(user => getFriends(user.id))
    friends!: Promise<User[]>;

    @lazyMember<User, 'littleBrothers'>({
        evaluate: user => getFriends(user.id, {maxAge: user.age}),
        resetBy: ['age']
    })
    littleBrothers!: Promise<User[]>;

    constructor(readonly id: string, age: number) {
    }
}

const user = new User('a5cba8f', 18)

user.friends.then(() => {})
// console output: "fetch:  http://api.domain.com/friends?userId=a5cba8f"

user.friends.then(() => {}) // nothing output

user.littleBrothers.then(() => {})
// console output: "fetch:  http://api.domain.com/friends?userId=a5cba8f&maxAge=18"

user.littleBrothers.then(() => {})
// nothing is output

user.age = 19;
// The `age` property has changed, so the `littleBrothers` property will also be reset.

user.littleBrothers.then(() => {})
// console output: "fetch:  http://api.domain.com/friends?userId=a5cba8f&maxAge=19"

```

## LICENSE

`@vgerbot/lazy` is [MIT Licensed](https://github.com/y1j2x34/lazy/blob/master/LICENSE)
