# @vgerbot/lazy  ![NPM](https://img.shields.io/npm/l/@vgerbot/lazy?style=social)

[![Test](https://github.com/y1j2x34/lazy/actions/workflows/runtest.yml/badge.svg)](https://github.com/y1j2x34/lazy/actions/workflows/runtest.yml)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/c829a1a9caa9451abe0a1c1dc71a87da)](https://www.codacy.com/gh/y1j2x34/lazy/dashboard?utm_source=github.com&utm_medium=referral&utm_content=y1j2x34/lazy&utm_campaign=Badge_Coverage)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/c829a1a9caa9451abe0a1c1dc71a87da)](https://www.codacy.com/gh/y1j2x34/lazy/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=y1j2x34/lazy&amp;utm_campaign=Badge_Grade)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-round)](https://github.com/prettier/prettier)

A library for defining lazily evaluated properties and variables powered by TypeScript.

## Motivation

`@vgerbot/lazy` is a useful tool for managing lazy evaluation properties.
It defers expensive property(or a variable) initialization until needed and avoids unnecessary repeated evaluation.
This library supports adding *reset tester* for lazy properties, once the *reset tester* detects a change, the property will be re-evaluated and initialized the next time the property is accessed, which simplifies a lot of work

## Install

```bash
npm i @vgerbot/lazy
```

## Usage

### `@lazyMember` decorator

> Requires the `compilerOptions.experimentalDecorators` in `tsconfig.json` to be set to `true`

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
```

With the lazy properties ready, we can now use it:

```ts
const user = new User('a5cba8f', 18)

user.friends.then(() => {
})
// console output: "fetch:  http://api.domain.com/friends?userId=a5cba8f"

user.friends.then(() => {
}) // nothing output

user.littleBrothers.then(() => {
})
// console output: "fetch:  http://api.domain.com/friends?userId=a5cba8f&maxAge=18"

user.littleBrothers.then(() => {
})
// nothing is output

user.age = 19;
// The `age` property has changed, so the `littleBrothers` property will also be reset.

user.littleBrothers.then(() => {
})
// console output: "fetch:  http://api.domain.com/friends?userId=a5cba8f&maxAge=<b>19</b>"

```


### `lazyMemberOfClass`

If you don't like or can't use decorators, you can do this:

```ts
import { lazyMemberOfClass } from '@vgerbot/lazy';

class User {
    friends!: Promise<User[]>;

    littleBrothers!: Promise<User[]>;

    constructor(readonly id: string, age: number) {
    }
}

lazyMemberOfClass(User, 'friends', (user) => getFriends(user.id));
lazyMemberOfClass(User, 'littleBrothers', {
    evaluate: user => getFriends(user.id, {maxAge: user.age}),
    resetBy: ['age']
});

```

The rest is the same as the appeal '@lazyMember', so I won't repeat it here.

### `lazyProp`

Define lazily evaluated property on an object:

```ts
import { lazyProp } from '@vgerbot/lazy';

const giraffe = {} as { rainbow: string };

lazyProp(object, 'rainbow', () => expansiveComputation());

console.log(giraffe.rainbow);

```

### `lazyVal`

Create a lazily evaluated value:

```ts
import { lazyVal } from '@vgerbot/lazy';

const value = lazyVal(() => expensiveComputation());

button.onclick = () => {
    doSomthing(value.get());
};
```

For more usage, see the unit test code.

## License

License under the [MIT Licensed (MIT)](https://github.com/y1j2x34/lazy/blob/master/LICENSE)
